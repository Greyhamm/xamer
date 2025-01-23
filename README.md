# Xamer - Modern Coding Assessment Platform

## About
Xamer is a revolutionary examination platform designed specifically for programming education. Unlike traditional coding assessments that focus heavily on syntax, Xamer provides a real-world coding environment where students can write, test, and debug their code live during examinations - just like they would in actual development scenarios.

### Vision
Our goal is to modernize programming education by:
- Enabling real-time code execution and testing during exams
- Focusing on problem-solving skills rather than syntax memorization
- Providing immediate feedback through live code execution
- Creating a more authentic coding experience that mirrors real-world development

## Features

### For Teachers
- Create custom coding examinations with support for multiple programming languages
- Add multiple question types:
  - Coding questions with live execution
  - Multiple choice questions
  - Written response questions
- Include media attachments (images/videos) in questions
- Real-time proctoring features
- Comprehensive grading interface
- Class management system
- Detailed analytics and performance tracking

### For Students
- Interactive coding environment with syntax highlighting
- Real-time code execution
- Support for multiple programming languages:
  - JavaScript
  - Python
  - Java
- Live output and error feedback
- Automatic submission tracking
- Progress monitoring

## Technical Stack

### Backend
- Node.js with Express
- MongoDB for data storage
- JWT for authentication
- Secure code execution environment

### Frontend
- Electron for cross-platform desktop application
- React components for UI
- Monaco Editor for code editing
- Real-time execution feedback
- Tailwind CSS for styling

### Security Features
- Secure authentication system
- Anti-cheating measures
- Safe code execution environment
- Session monitoring
- Proctoring capabilities

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/xamer.git
cd xamer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3000
```

4. Start MongoDB:
```bash
mongod
```

5. Run the application:
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## Contributing

We welcome contributions to Xamer! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Areas for Contribution
- Additional language support
- Enhanced testing features
- UI/UX improvements
- Security enhancements
- Documentation
- Performance optimization

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- Monaco Editor team for the powerful code editing capabilities
- Electron team for enabling cross-platform desktop development
- All contributors who help make this project better

## Future Roadmap
- Support for additional programming languages
- Advanced code analysis features
- AI-powered grading assistance
- Enhanced analytics and reporting
- Integration with popular learning management systems
- Mobile application support

## Support
For support, please open an issue in the GitHub repository or contact the maintainers directly.

---

Together, we can revolutionize how programming is taught and assessed in educational institutions. Join us in making coding education more practical and effective!
