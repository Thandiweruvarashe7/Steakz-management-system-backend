import transporter from '../config/email';

const FROM = process.env.EMAIL_FROM || 'Steakz UK <noreply@steakz.co.uk>';

export const sendReservationConfirmation = async (
  to: string,
  name: string,
  details: {
    branchName: string;
    date: string;
    time: string;
    partySize: number;
    tableNumber: number;
  }
): Promise<void> => {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Reservation Confirmed – Steakz UK',
    html: `
      <h2>Hello ${name},</h2>
      <p>Your reservation at <strong>Steakz UK ${details.branchName}</strong> has been confirmed.</p>
      <ul>
        <li><strong>Date:</strong> ${details.date}</li>
        <li><strong>Time:</strong> ${details.time}</li>
        <li><strong>Party size:</strong> ${details.partySize}</li>
        <li><strong>Table:</strong> ${details.tableNumber}</li>
      </ul>
      <p>We look forward to seeing you!</p>
      <p>— The Steakz UK Team</p>
    `,
  });
};

export const sendReservationCancellation = async (
  to: string,
  name: string,
  details: { branchName: string; date: string }
): Promise<void> => {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Reservation Cancelled – Steakz UK',
    html: `
      <h2>Hello ${name},</h2>
      <p>Your reservation at <strong>Steakz UK ${details.branchName}</strong> on <strong>${details.date}</strong> has been cancelled.</p>
      <p>If this was a mistake, please book again via our website.</p>
      <p>— The Steakz UK Team</p>
    `,
  });
};

export const sendPaymentReceipt = async (
  to: string,
  name: string,
  details: {
    orderId: string;
    amount: number;
    method: string;
    branchName: string;
  }
): Promise<void> => {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Payment Receipt – Steakz UK',
    html: `
      <h2>Thank you, ${name}!</h2>
      <p>Your payment at <strong>Steakz UK ${details.branchName}</strong> was successful.</p>
      <ul>
        <li><strong>Order ID:</strong> ${details.orderId}</li>
        <li><strong>Amount:</strong> £${details.amount.toFixed(2)}</li>
        <li><strong>Method:</strong> ${details.method}</li>
      </ul>
      <p>We hope to see you again soon!</p>
      <p>— The Steakz UK Team</p>
    `,
  });
};

export const sendPasswordReset = async (
  to: string,
  name: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Password Reset Request – Steakz UK',
    html: `
      <h2>Hello ${name},</h2>
      <p>You requested a password reset. Click the link below to set a new password:</p>
      <p><a href="${resetUrl}" style="background:#b91c1c;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;">Reset Password</a></p>
      <p>This link expires in 1 hour. If you did not request this, please ignore this email.</p>
      <p>— The Steakz UK Team</p>
    `,
  });
};

export const sendRoleChangedNotification = async (
  to: string,
  name: string,
  newRole: string,
  branchName?: string
): Promise<void> => {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Your Role Has Been Updated – Steakz UK',
    html: `
      <h2>Hello ${name},</h2>
      <p>Your role in the Steakz UK system has been updated to <strong>${newRole}</strong>${branchName ? ` at <strong>${branchName}</strong>` : ''}.</p>
      <p>If you have any questions, please contact HR or your branch manager.</p>
      <p>— The Steakz UK Team</p>
    `,
  });
};

export const sendWelcomeEmail = async (to: string, name: string): Promise<void> => {
  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Welcome to Steakz UK!',
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>Your Steakz UK account has been created. You can now book tables, view our menu, and manage your reservations.</p>
      <p>We look forward to serving you!</p>
      <p>— The Steakz UK Team</p>
    `,
  });
};
