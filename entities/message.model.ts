import mongoose, { Document, Schema } from 'mongoose';
import moment from 'moment';


// Định nghĩa interface cho Message
interface IMessage extends Document {
  roomId: number;
  senderId: number;
  content: string;
  nameUser: string;
  avatar: string;
  timestamp: string;
  getFormattedTimestamp(): string;
}
// Định nghĩa schema cho Message
const messageSchema = new Schema<IMessage>({
  roomId: { type: 'Number', required: true },
  senderId: { type: 'Number', required: true },
  content: { type: String, required: true },
  nameUser: { type: String },
  timestamp: { type: String, default: () => moment().format('HH:mm:ss DD/MM/YYYY') }, 
  avatar: { type: String },

});



// Tạo method để định dạng timestamp khi lấy dữ liệu
messageSchema.methods.getFormattedTimestamp = function() {
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };

  return this.timestamp.toLocaleString('vi-VN', options);
};


// Tạo model từ schema
const Message = mongoose.model<IMessage>('Message', messageSchema);

export default Message;
export { IMessage };