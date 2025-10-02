# AWS Community Day Cameroon - CMS

A comprehensive Content Management System built with Next.js 14, TypeScript, Prisma, and MongoDB for managing AWS Community Day events in Cameroon.

## 🚀 Features

- **Multi-Year Event Management** - Manage multiple event years with year-specific content
- **Speaker Management** - Add, edit, and showcase event speakers
- **Agenda Management** - Create and organize event schedules with sessions
- **Gallery Management** - Upload images to AWS S3 and organize event photos
- **Sponsor Management** - Manage event sponsors with tier categorization
- **Venue Management** - Configure venue information and details
- **User Management** - Admin user authentication and authorization
- **Multilingual Support** - English and French language support
- **Responsive Design** - Mobile-friendly admin interface

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **MongoDB** (local installation or MongoDB Atlas account)
- **AWS Account** (for S3 image storage)
- **Git**

## 🛠️ Installation & Setup

### 1. Clone the Repository
```
bash
git clone https://github.com/yll0rd/aws-community-day-cmr-cms.git
cd aws-community-day-cmr-cms
```
### 2. Install Dependencies
```
bash
npm install
```
### 3. Environment Variables Setup

Create a `.env` file in the root directory. You can use `.env.example` as a template:
```
bash
cp .env.example .env.local
```
Now configure the following environment variables inside a .env file:

#### **Database Configuration**
```
env
# MongoDB Connection String
# For local MongoDB:
DATABASE_URL="mongodb://localhost:27017/aws-community-cms"

# For MongoDB Atlas (recommended for production):
DATABASE_URL="mongodb+srv://<username>:<password>@<cluster>.mongodb.net/aws-community-cms?retryWrites=true&w=majority"
```
**How to get MongoDB Atlas URL:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string and replace `<username>`, `<password>`, and `<cluster>`

**How to Generate a secure JWT secret for .env.local:**
```
bash
# On Linux/Mac:
openssl rand -base64 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
#### **AWS S3 Configuration**
```
env
# AWS S3 Configuration for image uploads
NEXT_PUBLIC_AWS_S3_REGION="us-east-1"
NEXT_PUBLIC_AWS_S3_BUCKET_NAME="your-bucket-name"
NEXT_PUBLIC_AWS_S3_ACCESS_ID="your-aws-access-key-id"
NEXT_PUBLIC_AWS_S3_SECRET_KEY="your-aws-secret-access-key"
```
**How to get AWS S3 credentials:**

1. **Create an S3 Bucket:**
   - Log in to [AWS Console](https://console.aws.amazon.com/)
   - Go to S3 service
   - Click "Create bucket"
   - Choose a unique bucket name (e.g., `aws-cmr-community-day`)
   - Select a region (e.g., `us-east-1`)
   - Uncheck "Block all public access" (required for public image URLs)
   - Click "Create bucket"

2. **Configure Bucket CORS:**
   - Go to your bucket → Permissions → CORS
   - Add this configuration:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": []
     }
   ]
   ```

3. **Create IAM User for Programmatic Access:**
    - Go to IAM service → Users → Add users
    - User name: `aws-cms-uploader`
    - Check "Access key - Programmatic access"
    - Click "Next: Permissions"
    - Click "Attach existing policies directly"
    - Search and select `AmazonS3FullAccess` (or create a custom policy for your bucket only)
    - Click through to create user
    - **IMPORTANT:** Copy the Access Key ID and Secret Access Key (you can't see the secret again)

4. **Add credentials to `.env`:**
   ```env
   NEXT_PUBLIC_AWS_S3_ACCESS_ID="AKIAIOSFODNN7EXAMPLE"
   NEXT_PUBLIC_AWS_S3_SECRET_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
   ```

#### **Complete `.env.local` Example**

```env
# Database
DATABASE_URL="mongodb+srv://admin:password123@cluster0.abc123.mongodb.net/aws-community-cms?retryWrites=true&w=majority"

# Authentication
JWT_SECRET="aB3dF6hJ9kL2mN5pQ8rS1tV4wX7yZ0aC3eF6gI9jK2m"

# AWS S3
NEXT_PUBLIC_AWS_S3_REGION="us-east-1"
NEXT_PUBLIC_AWS_S3_BUCKET_NAME="aws-bucket-name"
NEXT_PUBLIC_AWS_S3_ACCESS_ID="AKIAIOSFODNN7EXAMPLE"
NEXT_PUBLIC_AWS_S3_SECRET_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"

# Public variables (for URL construction)
NEXT_PUBLIC_AWS_S3_BUCKET_NAME=
NEXT_PUBLIC_AWS_S3_REGION=

# User Credentials for Seeding
ADMIN_EMAIL=
ADMIN_PASSWORD=
ADMIN_NAME=

EDITOR_EMAIL=
EDITOR_PASSWORD=
EDITOR_NAME=
```


### 4. Database Setup

Initialize Prisma and create the database schema:

```shell script
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push
```


### 5. Seed Database (Optional but Recommended)

Seed the database with initial data including a default admin user and sample year:

```shell script
 npm run seed
```


**⚠️ IMPORTANT:** Change these credentials immediately after first login!

### 6. Run Development Server

```shell script
  npm run dev
```


The application will be available at [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
aws-community-day-cmr-cms/
├── app/                      # Next.js 14 App Router
│   ├── (dashboard)/         # Dashboard pages (admin routes)
│   ├── api/                 # API routes
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home/login page
├── components/              # React components
│   ├── auth/               # Authentication components
│   ├── layout/             # Layout components (sidebar, header)
│   ├── pages/              # Page-specific components (managers)
│   └── ui/                 # Reusable UI components
├── contexts/               # React contexts
│   ├── AuthContext.tsx     # Authentication state
│   ├── LanguageContext.tsx # i18n state
│   └── YearContext.tsx     # Year selection state
├── lib/                    # Utility libraries
│   ├── s3/                 # AWS S3 utilities
│   ├── api.ts              # API client functions
│   ├── auth.ts             # Authentication utilities
│   ├── db.ts               # Prisma client
│   └── validation.ts       # Form validation
├── prisma/                 # Prisma ORM
│   └── schema.prisma       # Database schema
├── scripts/                # Utility scripts
│   └── seed.ts             # Database seeding
├── .env                    # Environment variables (create this)
├── .env.example            # Environment template
|── .env.local              # Created when you run cp .env.example
├── package.json            # Dependencies
└── README.md              # This file
```


## 🔐 Authentication

The CMS uses JWT-based authentication with HTTP-only cookies for security.

### First Login

1. Navigate to [http://localhost:3000](http://localhost:3000)
2. Use the credentials (if you ran the seed script):
3. You'll be redirected to the dashboard

### Creating Additional Users

1. Go to **Users** in the sidebar
2. Click **Add User**
3. Fill in user details
4. Set role (admin/editor/viewer)
5. Save

## 📸 Image Upload Setup

All images (speakers, gallery, sponsors, etc.) are uploaded to AWS S3.

### Testing Image Upload

1. Go to **Gallery** in the sidebar
2. Click **Add Image**
3. Try uploading a test image
4. If successful, you should see the image with an S3 URL

### Troubleshooting Image Upload

If images fail to upload:

1. **Check S3 bucket permissions:**
    - Bucket must allow public read access
    - CORS must be configured correctly

2. **Verify AWS credentials:**
    - Access Key ID and Secret Key must be valid
    - IAM user must have S3 write permissions

3. **Check browser console:**
    - Look for CORS or 403 errors
    - Verify the bucket name and region are correct

## 🌍 Managing Event Years

The CMS is designed to manage multiple event years:

1. Go to **Settings** or use the year selector in the header
2. Create a new year for each event (e.g., 2024, 2025)
3. All content (speakers, agenda, gallery) is tied to a specific year
4. Switch between years using the year selector

## 📝 Available Scripts

```shell script
# Development
 npm run dev              # Start development server

# Production
 npm run build           # Build for production
 npm run start           # Start production server

# Database
 npm run postinstall     # Generate Prisma client and push schema
 npm run seed            # Seed database with initial data

# Linting
 npm run lint            # Run ESLint
```


## 🚀 Deployment

### Prerequisites for Deployment

1. MongoDB database (MongoDB Atlas recommended)
2. AWS S3 bucket configured
3. All environment variables set

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy

**Environment Variables on Vercel:**
- Add all variables from your `.env` file
- Go to Project Settings → Environment Variables
- Add each variable one by one

### Deploy to Other Platforms

The application can be deployed to any platform that supports Node.js:
- AWS Amplify
- Netlify
- Railway
- Render
- DigitalOcean App Platform

## 🔒 Security Notes

1. **Never commit `.env` to Git** - It's already in `.gitignore`
2. **Change default admin password** immediately after setup
3. **Use strong JWT secret** in production (32+ characters)
4. **Enable HTTPS** in production
5. **Regularly update dependencies** for security patches
6. **Limit S3 bucket permissions** to only what's needed

## 🐛 Troubleshooting

### Database Connection Issues

```shell script
# Test MongoDB connection
npx prisma studio
```


If this fails:
- Check MongoDB is running (local) or Atlas cluster is active
- Verify DATABASE_URL is correct
- Check network/firewall settings

### Build Errors

```shell script
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma Client
npx prisma generate
```


### Image Upload Fails

1. Check AWS credentials in `.env`
2. Verify S3 bucket exists and is publicly accessible
3. Check browser console for specific errors
4. Test AWS credentials using AWS CLI

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 💬 Support

For issues and questions:
- Open an issue on GitHub
- Contact the AWS Community Day Cameroon team

---

**Built with ❤️ for AWS Community Day Cameroon by [Traitz Tech](https://traitz.tech) led by [@JuniorDCoder](https://juniorgnu.netlify.app/) and significant contributions from [@yll0rd](https://github.com/yll0rd).**