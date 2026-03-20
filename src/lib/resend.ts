import { Resend } from "resend";
//singleton pattern
const resend = new Resend(process.env.RESEND_API_KEY);

export default resend;