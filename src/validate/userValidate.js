class UserValidate {
    //TODO- function for remove spaces empty on string
    static EMPTY_FIELD = "FIELD cannot be empty"

    static isEmail(value) {
        const email = /\S+@\S+\.\S+/;
        if (!value) {
            return { err: UserValidate.EMPTY_FIELD.replace("FIELD", "Email") };
        }
        if (!email.test(value)) {
            return { err: "Email is invalid" }
        }
        return true;
    }

    static isName(value) {
        const name = /^[A-Za-záàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ ]+$/;
        if (!value) {
            return { err: UserValidate.EMPTY_FIELD.replace("FIELD", "Name") };
        }
        if (!name.test(value)) {
            return { err: "Name must be a string" }
        }
        if (value.length < 6) {
            return { err: "Minimun 6 caracters" }
        }
        return true;
    }

    static isCPF(value) {
        const cpf = /^[0-9]{3}[\.]?[0-9]{3}[\.]?[0-9]{3}[\.]?[-]?[0-9]{2}$/;
        if (!value) {
            return { err: UserValidate.EMPTY_FIELD.replace("FIELD", "cpf") };
        }
        if (!cpf.test(value)) {
            return { err: "Format or cpf is invalid" }
        }
        return true;
    }

    static isPhone(value) {
        const phone = /^\(?[1-9]{2}\)? ?(?:[2-8]|9[1-9])[0-9]{3}\-?[0-9]{4}$/;
        if (!value) {
            return { err: UserValidate.EMPTY_FIELD.replace("FIELD", "phone") };
        }
        if (!phone.test(value)) {
            return { err: "Phone number is invalid" }
        }
        return true;
    }

    static isPassword(value) {
        const password = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[$*&@#])[0-9a-zA-Z$*&@#]{6,}$/;
        if (!value) {
            return { err: UserValidate.EMPTY_FIELD.replace("FIELD", "password") };
        }
        if (!password.test(value)) {
            return { err: "Password is not strong enough" }
        }
        return true;
    }
}

module.exports = UserValidate;