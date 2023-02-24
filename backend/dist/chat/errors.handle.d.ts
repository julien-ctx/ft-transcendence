export declare class errors {
    errors: any;
    status: string;
    name: string;
    desc: string;
    pass: string;
    cpass: string;
    errs: {
        status: string;
        name: string;
        desc: string;
        pass: string;
        cpass: string;
    };
    hasErrors(): boolean;
    handle(): void;
    constructor(status: string, name: string, desc: string, pass: string, cpass: string);
}
