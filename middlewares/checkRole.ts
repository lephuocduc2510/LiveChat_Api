import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';


const repository = AppDataSource.getRepository(Role);



// CHECK ROLES : MIDLEWARE
// Call allowRoles ('admin', 'user', 'managers')
const allowRoles = (...required_roles: any) => {
    return async (request: any, response: any, next: any) => {
        try {
            const bearerToken = request.get('Authorization')?.replace('Bearer ', '') ;
            console.log('Bearer token:', bearerToken);
            console.log('Bearer token:', bearerToken);
            if (!bearerToken) {
                return response.status(401).json({ message: 'No token provided' });
            }
            const payload = jwt.decode(bearerToken, { json: true });
            
            if (!payload) {
                return response.status(401).json({ message: 'Invalid token' });
            }
            // Lấy username và idRole từ payload
            const idRole = payload.idRole;
            console.log('Username and idRole from payload:', idRole);

            // Tìm kiếm role trong cơ sở dữ liệu
            const checkRole = await repository.findOneBy({ id: idRole });
            if (!checkRole) {
                return response.status(403).json({ message: 'Role not found' });
            }

            const nameRole = checkRole.roleName;
            const isAuthorized = required_roles.includes(nameRole);

           

            if (isAuthorized) {
                // in ra user đầy đủ thông tin user
                const user = await AppDataSource.getRepository(User).findOneBy({ id: payload.idUser });
                console.log('User:', user);
                request.user = user
                return next(); // Cho phép truy cập nếu role hợp lệ
            } else {
                return response.status(403).json({ message: 'Forbidden' }); // Từ chối truy cập nếu role không hợp lệ
            }
        } catch (error) {
            // Xử lý lỗi nếu có
            console.error(error);
            response.status(500).json({ message: 'Internal server error' });
        }
    };
};



export { allowRoles };