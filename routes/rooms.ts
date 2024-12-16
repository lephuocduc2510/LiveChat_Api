import express, { Request, Response } from 'express';
import { AppDataSource } from '../data-source'; 
import { Room } from '../entities/room.entiy';
import { User } from '../entities/user.entity';
import passport from 'passport';
import { passportVerifyToken } from '../middlewares/passportJwt';

passport.use('jwt', passportVerifyToken);
const router = express.Router();
const respository = AppDataSource.getRepository(Room);
const respositoryUser = AppDataSource.getRepository(User);

/* GET rooms listing. */
router.get('/', passport.authenticate('jwt', { session: false }), async function(req: Request, res: Response, next) {
    try {
        const rooms = await respository.find();
        if (rooms) {
        res.json(rooms);
        }
        else
        res.json({ message: 'No room found' });
    } catch (error) {
        res.json({ message: 'Internal server error', errors : error });
        
    }
    }
);

// Get room by Id
router.get('/:id', passport.authenticate('jwt', { session: false }) ,async function(req: Request, res: Response, next) {
    try {
        const room = await respository.findOneBy({ id: parseInt(req.params.id) });
        if (room) {
        res.json(room);
        }
        else
        res.json({ message: 'No room found' });
    } catch (error) {
        res.json({ message: 'Internal server error', errors : error });
        
    }
    }
);


// Get room by id user

router.get('/user/:id', passport.authenticate('jwt', { session: false }), async function(req: Request, res: Response, next) {
    try {
        const rooms = await respositoryUser.findOneBy({ id: parseInt(req.params.id) });
        if (rooms) {
        res.json(rooms);
        }
        else
        res.json({ message: 'No room found' });
    } catch (error) {
        res.json({ message: 'Internal server error', errors : error });
        
    }
    }
);



// Create new room

router.post('/', passport.authenticate('jwt', { session: false }),  async function(req: Request, res: Response, next) {
    try {
        const room = new Room();
        respository.merge(room, req.body);
        const result = await respository.save(room);
        res.json(result);
    } catch (error) {
        res.json({ message: 'Internal server error', errors : error });
        
    }
    }
);

// Update room

router.patch('/:id', passport.authenticate('jwt', { session: false }) ,async function(req: Request, res: Response, next) {
    try {
        const room = await respository.findOneBy({ id: parseInt(req.params.id) });
        if (room) {
        respository.merge(room, req.body);
        const result = await respository.save(room);
        res.json(result);
        }
        else
        res.json({ message: 'No room found' });
    } catch (error) {
        res.json({ message: 'Internal server error', errors : error });
        
    }
    }
);

//Delete room by Id
router.delete('/:id', passport.authenticate('jwt', { session: false }), async function(req: Request, res: Response, next) {
    try {
        const room = await respository.findOneBy({ id: parseInt(req.params.id) });
        if (room) {
        const result = await respository.remove(room);
        res.json(result);
        }
        else
        res.json({ message: 'No room found' });
    } catch (error) {
        res.json({ message: 'Internal server error', errors : error });
        
    }
    }
);

module.exports = router;
