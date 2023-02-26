"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errors = void 0;
class errors {
    constructor(status, name, desc, pass, cpass) {
        this.errors = [];
        this.errs = {
            'status': '',
            'name': '',
            'desc': '',
            'pass': '',
            'cpass': '',
        };
        this.status = status;
        this.name = name;
        this.desc = desc;
        this.pass = pass;
        this.cpass = cpass;
        console.log(this.status, this.name, this.desc, this.pass, this.cpass);
    }
    hasErrors() {
        if (this.errs.status !== '' || this.errs.name !== '' || this.errs.desc !== '' || this.errs.pass !== '' || this.errs.cpass !== '')
            return true;
    }
    handle() {
        if (this.status === '')
            this.errs.status = 'Status is required';
        if (this.name === '')
            this.errs.name = 'Name is required';
        else if (this.name.length < 6)
            this.errs.name = 'Name must be at least 6 characters';
        else if (this.name.length > 18)
            this.errs.name = 'Name must be less than 18 characters';
        if (this.status === 'Protected') {
            if (this.pass === '' || this.cpass === '')
                this.errs.pass = 'Password is required';
            else if (this.pass.length < 6)
                this.errs.pass = 'Password must be at least 6 characters';
            else if (this.pass.length > 18)
                this.errs.pass = 'Password must be less than 18 characters';
            else if (this.pass !== this.cpass)
                this.errs.cpass = 'Passwords must match';
        }
        if (this.status === 'Public' || this.desc === 'Private') {
            if (this.pass !== '' || this.cpass !== '')
                this.errs.status = 'Password not requiered';
        }
    }
}
exports.errors = errors;
//# sourceMappingURL=errors.handle.js.map