const MySQL = require('../connections/mysql');
const Crypt = require('../services/crypt');

class UserModel {

    static TYPE_DESCRIPTION = ["Administrador", "Cliente"];

    static register(cpf, name, email, password, phone, type) {
        const _password = Crypt.encrypt(password);

        return new Promise((resolve, reject) => {
            const userQuery = `
                SELECT u.cpf 
                FROM user AS u
                INNER JOIN  login AS l ON u.id = l.id_user
                WHERE u.cpf='${cpf}' OR l.email='${email}';
            `;
            MySQL.query(userQuery, (err, result) => {
                if (err) return reject({ status_code: 500, result: err });
                if (result.length) {
                    return reject({ status_code: 409, result: "User Already Exist" });
                }
            });

            const selctPermission = `
                SELECT id
                FROM permission
                WHERE permission = ${Number(type)}
            `;
            MySQL.query(selctPermission, (err, resultPermission) => {
                if (err) return reject({ status_code: 500, result: err });
                const idPermission = resultPermission[0].id;

                const registerUser = `
                    INSERT INTO user (cpf, name, phone, id_permission) 
                    VALUES ('${cpf}', '${name}', '${phone}', '${idPermission}');
                `;
                MySQL.query(registerUser, (err, resultUser) => {
                    if (err) return reject({ status_code: 500, result: err });
                    const idUser = resultUser.insertId;

                    const linkToken = `
                        INSERT INTO token (id_user)
                        VALUES ('${idUser}');
                    `;
                    MySQL.query(linkToken, (err, resultToken) => {
                        if (err) return reject({ status_code: 500, result: err });
                    });

                    const registerLogin = `
                        INSERT INTO login (id_user, email, password) 
                        VALUES ('${idUser}','${email}', '${_password}');
                    `;
                    MySQL.query(registerLogin, (err, resultLogin) => {
                        if (err) return reject({ status_code: 500, result: err });
                        resolve({ status_code: 204, result: "User created successfully" });
                    });
                });
            });
        });
    }

    static listAll() {
        const listUsers = `
            SELECT u.id, u.name, u.phone, u.create_time, l.email, p.permission, p.permission_description
            FROM user u
            INNER JOIN login l ON u.id = l.id_user
            INNER JOIN permission p ON p.id = u.id_permission
        `;
        return new Promise((resolve, reject) => {
            MySQL.query(listUsers, (err, results) => {
                if (err) return reject({ status_code: 500, result: err });
                if (results.length) {
                    const listUser = results.map(item => item);
                    resolve({ status_code: 200, result: listUser });
                }
                else reject({ status_code: 404, result: "Not Found" })
            });
        });
    }

    static listOne(userId) {
        return new Promise((resolve, reject) => {
            const findUserQuery = `
                SELECT u.id, u.name, u.phone, l.email, p.permission, p.permission_description
                FROM user AS u
                INNER JOIN login as l ON u.id = l.id_user
                INNER JOIN permission p ON p.id = u.id_permission
                WHERE u.id='${userId}';
            `;
            MySQL.query(findUserQuery, (err, result) => {
                if (err) return reject({ status_code: 500, result: err });
                if (result.length) {
                    resolve({ status_code: 200, result: result[0] });
                }
                else reject({ status_code: 404, result: "Not Found" });
            });
        });
    }

    static updateUser(idUser, name, email, password, phone) {
        const _password = Crypt.encrypt(password);
        const hasPassword = password ? `password='${_password}',` : "\n";

        return new Promise((resolve, reject) => {
            const emailExist = `
                SELECT email, id_user
                FROM login 
                WHERE id_user='${idUser}';`
            ;
            MySQL.query(emailExist, (err, result) => {
                if (err) return reject({ status_code: 400, result: err });
                if (email === result[0]?.email && result[0]?.id_user == idUser) {
                    const updateUser = `
                            UPDATE user SET
                            name='${name}',                         
                            phone='${phone}' 
                            WHERE id=${idUser};
                        `;
                    console.log(hasPassword);
                    MySQL.query(updateUser, (err, result) => {
                        if (err) reject({ status_code: 500, result: err });
                        const updateLogin = `
                                UPDATE login SET
                                ${hasPassword}
                                email='${email}'
                                WHERE id_user=${idUser};
                            `;
                        MySQL.query(updateLogin, (err, result) => {
                            if (err) reject({ status_code: 500, result: err });
                            resolve({ status_code: 200, result: 'User updated successfully' });
                        });
                    });
                } else {
                    return reject({ status_code: 409, result: "eamil already exists" });
                }
            });
        });
    }

    static updatePassword(id, password) {
        return new Promise((resolve, reject) => {
            const _password = Crypt.encrypt(password);
            const updatePassword = `UPDATE login SET password='${_password}' WHERE id_user=${id};`
            MySQL.query(updatePassword, (err, result) => {
                if (err) return reject({ status_code: 500, result: err });
                if (result.affectedRows)
                    resolve({ status_code: 200, result: 'Password updated successfully' });
            });
        });
    }

    static deleteUser(id) {
        return new Promise((resolve, reject) => {
            const deleteUser = `DELETE FROM user WHERE id='${id}'`;

            MySQL.query(deleteUser, (err, result) => {
                if (err) return reject({ status_code: 500, result: err });
                if (result.affectedRows) {
                    resolve({ status_code: 201, result: 'User deleted successfully' })
                }
                else reject({ status_code: 404, result: 'Not Found' });
            });
        });
    }
}

module.exports = UserModel;