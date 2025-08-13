# AWS Community Day CMS 🚀

A modern, responsive Content Management System built for managing AWS Community Day events. This CMS provides an intuitive dashboard for event organizers to manage speakers, agenda, gallery, sponsors, and venue information.

## ✨ Features

### 🔐 Authentication & Authorization
- **Role-based access control** with Admin and Editor roles
- **Secure login system** with session management
- **User profile management** with avatars

### 📊 Dashboard & Analytics
- **Comprehensive dashboard** with real-time statistics
- **Activity tracking** and recent updates overview
- **Multi-language support** (English & French)
- **Year-based event management**

### 🎯 Content Management
- **Hero Section Manager** - Manage banner images and hero content
- **Speaker Management** - Add, edit, and organize speaker profiles
- **Agenda Manager** - Schedule events and manage program timeline
- **Gallery Manager** - Upload and organize event photos
- **Sponsor Management** - Manage sponsor information and logos
- **Venue Manager** - Configure venue details and location info
- **Contact Manager** - Manage contact information and inquiries
- **User Management** - Admin controls for user accounts

### 🌐 Internationalization
- **Multi-language support** with context-based translations
- **Language switcher** in the header
- **Localized content management**

### 🎨 Modern UI/UX
- **Responsive design** that works on all devices
- **Clean, modern interface** built with Tailwind CSS
- **Intuitive navigation** with collapsible sidebar
- **Loading states** and smooth transitions
- **AWS-themed styling** with custom color palette

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context API
- **Authentication**: Custom auth context with localStorage
- **Development**: ESLint for code quality

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aws_cms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality checks

## 🔑 Default Login Credentials

For development and testing purposes, use these credentials:

**Admin User:**
- Email: `admin@awscommunity.cm`
- Password: `admin123`
- Role: Admin (full access)

**Editor User:**
- Email: `editor@awscommunity.cm`
- Password: `editor123`
- Role: Editor (limited access)

## 📁 Project Structure

```
aws_cms/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Main page component
│   └── fonts/             # Custom fonts (Geist)
├── components/            # React components
│   ├── Dashboard.tsx      # Main dashboard component
│   ├── auth/              # Authentication components
│   ├── layout/            # Layout components (Header, Sidebar)
│   └── pages/             # Page-specific components
├── contexts/              # React contexts
│   ├── AuthContext.tsx    # Authentication state
│   ├── LanguageContext.tsx# Internationalization
│   └── YearContext.tsx    # Year management
├── hooks/                 # Custom React hooks
└── public/               # Static assets
```

## 🌍 Internationalization

The CMS supports multiple languages:

- **English** (default)
- **French** (Français)

Language context provides:
- Dynamic translation system
- Language switcher in header
- Persistent language selection
- Extensible translation keys

## 🎨 Design System

### Color Palette
- **Primary**: AWS Orange theme
- **Secondary**: Complementary colors
- **UI**: Neutral grays for interface elements
- **Status**: Success, warning, and error states

### Typography
- **Primary Font**: Geist Sans
- **Monospace**: Geist Mono
- **Responsive scaling** across devices

## 🔧 Configuration

### Environment Setup
The application uses local storage for session management and mock data for development. For production deployment, consider integrating with:

- **Database**: PostgreSQL, MongoDB, or AWS DynamoDB
- **Authentication**: AWS Cognito, Auth0, or NextAuth.js
- **File Storage**: AWS S3 for image uploads
- **Analytics**: AWS CloudWatch or Google Analytics

### Customization
- **Branding**: Update colors in `tailwind.config.ts`
- **Translations**: Add new languages in `LanguageContext.tsx`
- **Features**: Extend managers in `components/pages/`

## 📱 Responsive Design

The CMS is fully responsive and optimized for:
- **Desktop**: Full-featured dashboard experience
- **Tablet**: Optimized touch interface
- **Mobile**: Collapsible navigation and touch-friendly controls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Future Enhancements

- [ ] **Database Integration** - Replace mock data with real database
- [ ] **File Upload System** - Implement image upload functionality
- [ ] **Real-time Updates** - Add WebSocket support for live updates
- [ ] **Email Notifications** - Integrate email system for user management
- [ ] **Advanced Analytics** - Enhanced dashboard metrics and reporting
- [ ] **Export Features** - Export data to various formats (PDF, CSV)
- [ ] **API Integration** - RESTful API for external integrations
- [ ] **Mobile App** - React Native companion app

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation in the `/docs` folder

---

**Built with ❤️ for the AWS Community Day Cameroon 2025**

*This CMS is designed to streamline event management and provide a seamless experience for both organizers and attendees.*