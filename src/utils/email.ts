import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_SECRET_KEY);

interface User {
  email: string;
  name: string;
}

interface Message {
  subject: string;
  html: string;
}

class Email {
  private to: string;
  private firstName: string;
  private from: string;

  constructor(user: User) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.from = "greenthreads@resend.dev";
  }

  // Send the actual email
  async send(message: Message): Promise<void> {
    // Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: message.subject,
      html: message.html,
    };

    // Create a transport and send email
    const { data, error } = await resend.emails.send(mailOptions);
    if (error) {
      console.log(error, "RESEND_ERROR");
    }

    console.log(data, "RESEND_DATA");
  }
}

export default Email;
