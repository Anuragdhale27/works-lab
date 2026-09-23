import type { ResumeData } from '../types/resume';

export const sampleResumeData: ResumeData = {
  personal: {
    name: 'Rahul Sharma',
    title: 'Software Engineer',
    email: 'rahul@email.com',
    phone: '+91 98765 43210',
    location: 'Bengaluru, India',
    linkedin: 'linkedin.com/in/rahuls',
    portfolio: 'github.com/rahuls',
    photo: '',
  },
  summary:
    'Results-driven software engineer with 3+ years of experience building scalable web applications. Proficient in React, Node.js, and cloud infrastructure.',
  experience: [
    {
      company: 'Infosys',
      title: 'Senior Software Engineer',
      location: 'Bengaluru',
      start: 'Jun 2022',
      end: 'Present',
      description:
        '• Led development of microservices architecture serving 500K+ daily users\n• Reduced API response time by 40% through caching and query optimisation\n• Mentored team of 3 junior engineers on best practices',
    },
    {
      company: 'Wipro',
      title: 'Software Engineer',
      location: 'Hyderabad',
      start: 'Jul 2020',
      end: 'May 2022',
      description: '• Built RESTful APIs and React dashboards for enterprise clients in the BFSI sector\n• Improved database query performance by 35% with indexing strategies',
    },
  ],
  education: [
    {
      degree: 'B.Tech Computer Science',
      institution: 'VIT Vellore',
      location: 'Vellore',
      start: '2016',
      end: '2020',
      description: 'CGPA: 8.7',
    },
  ],
  skills: ['React', 'Node.js', 'Python', 'AWS', 'PostgreSQL', 'Docker', 'Git'],
  projects: [
    {
      name: 'E-Commerce Platform',
      tech: 'React, Node.js, MongoDB',
      url: 'github.com/rahuls/shop',
      description: '• Full-stack marketplace with payment integration and real-time inventory\n• Handled 10K+ concurrent users with optimized database queries\n• Integrated Stripe for secure payment processing',
    },
  ],
  certifications: [{ name: 'AWS Cloud Practitioner', org: 'Amazon Web Services', year: '2023', url: '' }],
  languages: [
    { lang: 'English', level: 'Professional' },
    { lang: 'Hindi', level: 'Native' },
  ],
  awards: [
    {
      title: 'Spot Award',
      issuer: 'Infosys',
      year: '2023',
      description: 'Recognized for excellence in microservices architecture design and technical leadership',
    },
  ],
  customSections: [
    {
      id: 'volunteering',
      title: 'Volunteering',
      items: [
        {
          heading: 'Teach For India',
          subheading: 'Weekend Mentor',
          date: '2021 – Present',
          description: '• Mentored 12 students in coding basics\n• Developed curriculum for Python fundamentals',
        },
      ],
    },
  ],
  sectionOrder: [],
};
