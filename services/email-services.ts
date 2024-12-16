import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { AppDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import { UserVerification } from '../entities/userVerification.entiy';





 const repository = AppDataSource.getRepository(UserVerification);





let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user:  process.env.AUTH_EMAIL, // Thay bằng email của bạn
      pass: process.env.AUTH_PASS,  // Thay bằng mật khẩu ứng dụng
    },
  });
  
  


// ------------------------------------------------------------------------------------------------
// Send verify email
// ------------------------------------------------------------------------------------------------
const sendVerifyEmail = async function (_id: any, email: any, res: Response) {
  try {
    const currenUrl = "http://localhost:3000";
    const uniqueString = uuidv4() + _id;
   
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: 'Verify Email',
      html: `<p>Verify your email address to complete the signup and login into your account</p> 
             <p>This link <b>expires in 6 hours</b>.</p>    
             <p>Press <a href="${currenUrl}/auth/verify/${_id}/${uniqueString}">here</a> to proceed</p>`,
    };

    // Hash the unique string
    const saltRounds = 10;
    const hashedString = await bcrypt.hash(uniqueString, saltRounds);

    // Set values in userVerification collection
    const newVerification = repository.create({    
      uniqueString: hashedString,
      createdAt: new Date(),
      expireAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours later
      userId: _id,
    });

    await repository.save(newVerification);

    // Send the verification email
    await transporter.sendMail(mailOptions);
    res.json({
      status: "PENDING",
      message: "Verification email sent",
    });
  } catch (error: any) {
    console.error("Error during email verification process:", error);

    if (error.message.includes("hashing")) {
      res.status(500).json({
        status: "failed",
        message: "An error occurred while hashing the unique string",
      });
    } else if (error.message.includes("save")) {
      res.status(500).json({
        status: "failed",
        message: "Couldn't save verification email data",
      });
    } else {
      res.status(500).json({
        status: "failed",
        message: "Verification email failed",
        error: error.message,
      });
    }
  }
};


 export default sendVerifyEmail;