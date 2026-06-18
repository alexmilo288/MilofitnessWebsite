import smtplib
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_EMAIL = "niharsuthar18@gmail.com"
SMTP_PASSWORD = "toab tnzc otbw xrqy"       


def generate_code():
    return str(random.randint(100000, 999999))


def send_verification_email(to_email, code, username):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "MiloFitness – Your Verification Code"
    msg["From"] = SMTP_EMAIL
    msg["To"] = to_email

    html = f"""
    <div style="font-family:Arial,sans-serif;background:#0a0a0a;padding:40px;">
      <div style="max-width:480px;margin:0 auto;background:#181818;border-radius:8px;
                  border-top:3px solid #0a84ff;overflow:hidden;">
        <div style="padding:36px 40px;">
          <p style="font-family:'Arial Black',sans-serif;font-size:22px;
                    font-weight:900;letter-spacing:3px;margin:0 0 24px;">
            <span style="color:#ffffff;">MILO</span>
            <span style="color:#0a84ff;">FITNESS</span>
          </p>
          <p style="color:#888;font-size:14px;letter-spacing:2px;
                    text-transform:uppercase;margin:0 0 8px;">Verification Code</p>
          <p style="color:#ffffff;font-size:16px;margin:0 0 28px;">
            Hey {username}, here is your one-time code:
          </p>
          <div style="background:#111;border:1px solid #222;border-radius:6px;
                      padding:24px;text-align:center;margin-bottom:28px;">
            <span style="font-size:42px;font-weight:900;letter-spacing:12px;
                         color:#0a84ff;">{code}</span>
          </div>
          <p style="color:#555;font-size:13px;margin:0;">
            This code expires in 10 minutes. If you did not request this, ignore this email.
          </p>
        </div>
      </div>
    </div>
    """

    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, to_email, msg.as_string())

def send_contact_email(name, email, program, message):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"MiloFitness Enquiry — {name}"
    msg["From"] = SMTP_EMAIL
    msg["To"] = "26sutharn@student.pac.nsw.edu.au"  
    html = f"""
    <div style="font-family:Arial,sans-serif;background:#0a0a0a;padding:40px;">
      <div style="max-width:480px;margin:0 auto;background:#181818;border-radius:8px;
                  border-top:3px solid #0a84ff;overflow:hidden;">
        <div style="padding:36px 40px;">
          <p style="font-family:'Arial Black',sans-serif;font-size:22px;
                    font-weight:900;letter-spacing:3px;margin:0 0 24px;">
            <span style="color:#ffffff;">MILO</span>
            <span style="color:#0a84ff;">FITNESS</span>
          </p>
          <p style="color:#888;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">Name</p>
          <p style="color:#ffffff;font-size:16px;margin:0 0 20px;">{name}</p>
          <p style="color:#888;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">Email</p>
          <p style="color:#ffffff;font-size:16px;margin:0 0 20px;">{email}</p>
          <p style="color:#888;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">Interested In</p>
          <p style="color:#ffffff;font-size:16px;margin:0 0 20px;">{program}</p>
          <p style="color:#888;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">Message</p>
          <div style="background:#111;border:1px solid #222;border-radius:6px;padding:20px;">
            <p style="color:#ffffff;font-size:15px;margin:0;line-height:1.6;">{message}</p>
          </div>
        </div>
      </div>
    </div>
    """

    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, "26sutharn@student.pac.nsw.edu.au", msg.as_string())