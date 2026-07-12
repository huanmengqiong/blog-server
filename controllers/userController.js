const userService = require('../services/userService');
const ResponseHelper = require('../utils/responseHelper');

class UserController {
    async register(req, res, next) {
        try {
            const { username, email, password } = req.body;

            if (!username || !email || !password) {
                return ResponseHelper.error(res, '用户名、邮箱和密码不能为空', 400);
            }
            if (password.length < 6) {
                return ResponseHelper.error(res, '密码长度不能少于6位', 400);
            }

            const user = await userService.register({ username, email, password });
            return ResponseHelper.success(res, user, '注册成功', 201);
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return ResponseHelper.error(res, '邮箱和密码不能为空', 400);
            }

            const result = await userService.login(email, password);
            return ResponseHelper.success(res, result, '登录成功');
        } catch (error) {
            next(error);
        }
    }

    async getProfile(req, res, next) {
        try {
            const user = await userService.getProfile(req.user.id);
            return ResponseHelper.success(res, user, '获取用户信息成功');
        } catch (error) {
            next(error);
        }
    }

    async updateProfile(req, res, next) {
        try {
            const updateData = req.body;
            const user = await userService.updateProfile(req.user.id, updateData);
            return ResponseHelper.success(res, user, '更新用户信息成功');
        } catch (error) {
            next(error);
        }
    }

    async updatePassword(req, res, next) {
        try {
            const { oldPassword, newPassword } = req.body;

            if (!oldPassword || !newPassword) {
                return ResponseHelper.error(res, '原密码和新密码不能为空', 400);
            }

            if (newPassword.length < 6) {
                return ResponseHelper.error(res, '新密码长度不能少于6位', 400);
            }

            await userService.updatePassword(req.user.id, oldPassword, newPassword);
            return ResponseHelper.success(res, null, '密码修改成功');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();