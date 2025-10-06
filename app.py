from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
import os
import binascii
import re
from flask import request, flash, redirect, url_for
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_wtf.csrf import CSRFProtect
from flask import session
from datetime import timedelta
from flask_talisman import Talisman
from flask_migrate import Migrate
from flask_mail import Mail, Message
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user

# Generate a secret key

def generate_secret_key():
    return binascii.hexlify(os.urandom(24)).decode()

secret_key = generate_secret_key()



app = Flask(__name__)
csrf = CSRFProtect(app)

app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=30)

Talisman(
    app,
    force_https=True,
    strict_transport_security=True,
    session_cookie_secure=True,
    content_security_policy={
        'default-src': "'self'",
        'script-src': ["'self'", "'unsafe-inline'"],
        'style-src': ["'self'", "'unsafe-inline'"],
    }
)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'signin'  # This is your login route name

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# PostgreSQL Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:Stemfastfixers%40123@localhost/OtterDB'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = secret_key
app.config['SESSION_COOKIE_SECURE'] = True

# Email Configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'  # Example for Gmail
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'ameerbasha.wh@gmail.com'  # Your email
app.config['MAIL_PASSWORD'] = 'zybuokadripgtegl'  # Use app-specific password
app.config['MAIL_DEFAULT_SENDER'] = 'ameerbasha.wh@gmail.com'

mail = Mail(app)


# Initialize Database
db = SQLAlchemy(app)

migrate = Migrate(app, db)

with app.app_context():
    db.create_all()

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["1000 per hour"] if app.debug else ["200 per day", "50 per hour"]  )

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phonenumber = db.Column(db.String(15), unique=True, nullable=True)  # Added phone number
    password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))  # Added timestamp
    updated_at = db.Column(db.DateTime, default=datetime.now(timezone.utc), onupdate=datetime.now(timezone.utc))

    def __repr__(self):
        return f"User('{self.username}', '{self.email}')"
    
@app.route('/')
def home():
    return render_template('home.html')

# Sign-in route
import re
from flask import request, flash, redirect, url_for

@app.route('/signup', methods=['GET', 'POST'])
@limiter.limit("5 per minute")
def signup():
    
    if request.method == 'GET':
        # Just render signup page on GET
        return render_template('signup.html')
    
    if request.is_json:
        data = request.get_json()
    else:
        data = request.form  # Get JSON data instead of form data
        
    username = data.get('username')
    email = data.get('email')
    phonenumber = data.get('phonenumber')
    password = data.get('password')
    retype_password = data.get('retype_password')

    # Validate password match
    if password != retype_password:
        return jsonify({
            'success': False,
            'error': 'Passwords do not match'
        }), 400
        
    # Validate password complexity
    if len(password) < 8 or not any(char.isdigit() for char in password) or not any(char.isupper() for char in password):
        return jsonify({
            'success': False,
            'error': 'Password must be 8+ chars with at least 1 number and 1 uppercase letter'
        }), 400
        
    # Email validation
    if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email):
            return jsonify({
            'success': False,
            'error': 'Invalid email format'
        }), 400
        
    # Phone number validation
    if phonenumber and not re.match(r'^\+?[0-9]{10,15}$', phonenumber):
            return jsonify({
            'success': False,
            'error': 'Phone number must be 10-15 digits'
        }), 400

    # Check for existing user
    if User.query.filter_by(email=email).first():
            return jsonify({
            'success': False,
            'error': 'Email already exists'
        }), 400
        
    if User.query.filter_by(username=username).first():
            return jsonify({
            'success': False,
            'error': 'Username already exists'
        }), 400
        
    if phonenumber and User.query.filter_by(phonenumber=phonenumber).first():
            return jsonify({
            'success': False,
            'error': 'Phone number already registered'
        }), 400

    # Create new user
    try:
        hashed_password = generate_password_hash(password)
        new_user = User(
            username=username,
            email=email,
            phonenumber=phonenumber,
            password=hashed_password
        )
        db.session.add(new_user)
        db.session.commit()
        
        # Send welcome email
        try:
            msg = Message(
                subject="Welcome to VsprNote!",
                recipients=[email],
                html=render_template('welcome.html', 
                                    username=username)
            )
            mail.send(msg)
            app.logger.info(f"Welcome email sent to {email}")
        except Exception as e:
            app.logger.error(f"Failed to send welcome email: {str(e)}")
        
        return jsonify({
            'success': True,
            'message': 'Account created successfully! A welcome email has been sent.'
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    
    return render_template('signup.html')



@app.route('/signin', methods=['GET', 'POST'])
@limiter.limit("10 per minute")
def signin():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            flash('You were successfully logged in')
            return redirect(url_for('main'))
        else:
            flash('Login failed. Check your email and password.')
            return redirect(url_for('signin'))
        
    return render_template('signup.html')


def is_logged_in():
    return 'user_id' in session

@app.errorhandler(429)
def ratelimit_handler(e):
    return "You have exceeded your request rate. Please try again later.", 429

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    flash("You have been logged out.")
    return redirect(url_for('signin'))

@app.route('/vspr', methods=['GET', 'POST'])
def main():
    if not is_logged_in():
        flash("You must be logged in to view this page.")
        return redirect(url_for('signin'))
    return render_template("vspr.html")


@app.route('/profile-content')
@login_required
def profile_content():
    user = current_user
    return render_template('profile-content.html', user=user)

if __name__ == '__main__':
    app.run(debug=True)
