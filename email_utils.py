import smtplib
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SMTP_EMAIL = "alexmilo288@gmail.com"
SMTP_PASSWORD = "ivjp jcsb pjyc zjzp"       


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
    msg["To"] = "alexmilo288@gmail.com"  
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
        server.sendmail(SMTP_EMAIL, "alexmilo288@gmail.com", msg.as_string())



# ── ADD this function to email_utils.py (anywhere below the imports) ──

def send_booking_notification_email(to_email, client_name, day_label, start_time, end_time, label, login_url):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "MiloFitness – New Session Booked"
    msg["From"] = SMTP_EMAIL
    msg["To"] = to_email

    label_html = ""
    if label:
        label_html = f"""
          <p style="color:#888;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">Session</p>
          <p style="color:#ffffff;font-size:16px;margin:0 0 20px;">{label}</p>
        """

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
                    text-transform:uppercase;margin:0 0 8px;">New Session Booked</p>
          <p style="color:#ffffff;font-size:16px;margin:0 0 28px;">
            Hey {client_name}, you've been booked in for a session:
          </p>

          <div style="background:#111;border:1px solid #222;border-radius:6px;
                      padding:24px;margin-bottom:28px;">
            <p style="color:#888;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">When</p>
            <p style="color:#0a84ff;font-size:20px;font-weight:900;margin:0 0 20px;">
              {day_label}, {start_time}–{end_time}
            </p>
            {label_html}
          </div>

          <a href="{login_url}" style="display:inline-block;background:#0a84ff;color:#ffffff;
                    text-decoration:none;font-weight:700;font-size:14px;letter-spacing:1px;
                    text-transform:uppercase;padding:14px 28px;border-radius:6px;">
            View Your Timetable
          </a>

          <p style="color:#555;font-size:13px;margin:24px 0 0;">
            Log in to MiloFitness to see your full schedule.
          </p>
        </div>
      </div>
    </div>
    """

    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, to_email, msg.as_string())