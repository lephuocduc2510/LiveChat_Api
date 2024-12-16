import express, { Request, Response } from 'express';
const router = express.Router();
import { AppDataSource } from '../data-source'; 
import { Role } from '../entities/role.entity';

const respository = AppDataSource.getRepository(Role);

/* GET roles listing. */
router.get('/', async function(req: Request, res: Response, next) {
  try {
    const roles = await respository.find();
    if (roles.length > 0) {
      res.json(roles);
    }
    else
     res.json({ message: 'No role found' });
  } catch (error) {
    res.json({ message: 'Internal server error', errors : error });
    
  }
});

// Get role by Id
router.get('/:id', async function(req: Request, res: Response, next) {
    try {
        const role = await respository.findOneBy({ id: parseInt(req.params.id) });
        if (role) {
        res.json(role);
        }
        else
        res.json({ message: 'No role found' });
    } catch (error) {
        res.json({ message: 'Internal server error', errors : error });
        
    }
    }
);

// Create new role

router.post('/', async function(req: Request, res: Response, next) {
    try {
        const role = await respository.save(req.body);
        if (role) {
        res.json(role);
        }
        else
        res.json({ message: 'No role found' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', errors : error });
        
    }
    }
);

// Update role by Id

router.patch('/:id', async function(req: Request, res: Response, next) {
    try {
        const role = await respository.findOneBy({ id: parseInt(req.params.id) });
        if (role) {
        respository.merge(role, req.body);
        const result = await respository.save(role);    
        res.json(result);
        }
        else
        res.json({ message: 'No role found' });
    } catch (error) {
        res.json({ message: 'Internal server error', errors : error });
        
    }
    }
);

//Delete role by Id
router.delete('/:id', async function(req: Request, res: Response, next) {
    try {
        const role = await respository.findOneBy({ id: parseInt(req.params.id) });
        if (role) {
        const result = await respository.remove(role);
        res.json(result);
        }
        else
        res.json({ message: 'No role found' });
    } catch (error) {
        res.json({ message: 'Internal server error', errors : error });
        
    }
    }
);

module.exports = router;
