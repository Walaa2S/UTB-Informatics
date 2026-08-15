'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

/* =========================================================
   HUAWEI ICT ACADEMY
========================================================= */

const HUAWEI_PORTAL =
  'https://e.huawei.com/en/talent/learning/#/ict-academy';

/* =========================================================
   COURSE DATA
========================================================= */

const HUAWEI_COURSES = [
  /* =======================================================
     IoT ENGINEERING
  ======================================================= */

  {
    major: 'IoT Engineering',
    category: 'College Courses',
    title: 'Exploring the Intelligent World 2030',
    emoji: '🌐',
    status: 'Active',
    description:
      'Explore future trends, intelligent technologies, and the evolution of the digital world.',
    duration: '4 hours',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'IoT Engineering',
    category: 'Certification Courses',
    title: 'HCIA-IoT V3.0 Course',
    emoji: '🔌',
    status: 'Active',
    description:
      'Certification training covering IoT architecture, sensor integration, and end-to-end IoT solutions.',
    duration: '32 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'IoT Engineering',
    category: 'College Courses',
    title: 'Overview of IoT Technologies',
    emoji: '📡',
    status: 'Active',
    description:
      'Introduction to IoT, NB-IoT, wireless protocols, and practical edge computing deployment.',
    duration: '2 hours',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'IoT Engineering',
    category: 'College Courses',
    title: 'Internet of Things Technology and Applications',
    emoji: '💡',
    status: 'Active',
    description:
      'Explore IoT frameworks, smart systems design, connected devices, and industrial applications.',
    duration: '48 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'IoT Engineering',
    category: 'Certification Courses',
    title: 'HCIE-openGauss V1.0 Course',
    emoji: '🗄️',
    status: 'Active',
    description:
      'Advanced expert-level training focusing on openGauss database architecture, storage management, transaction logs, and database optimization.',
    duration: '30 hours',
    level: 'Advanced',
    link: HUAWEI_PORTAL,
  },

  /* =======================================================
     ICT ACADEMY
  ======================================================= */

  {
    major: 'ICT Academy Class',
    category: 'Core Class',
    title: 'DataCom',
    emoji: '🌐',
    status: 'Active',
    description:
      'Essential data communication, routing, and switching principles for modern IT infrastructure.',
    duration: '—',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'ICT Academy Class',
    category: 'AI Class',
    title: 'AI',
    emoji: '🤖',
    status: 'Active',
    description:
      'Artificial Intelligence foundations, intelligent models, and machine learning architectures.',
    duration: '—',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'ICT Academy Class',
    category: 'Cloud Class',
    title: 'Cloud Computing',
    emoji: '☁️',
    status: 'Active',
    description:
      'Cloud storage, virtualization, and enterprise cloud architecture deployment.',
    duration: '—',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'ICT Academy Class',
    category: 'Security Class',
    title: 'Network Security (Track 1)',
    emoji: '🔒',
    status: 'Active',
    description:
      'Firewall configurations, cryptography, and defense against enterprise cyber threats.',
    duration: '—',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'ICT Academy Class',
    category: 'IoT Class',
    title: 'IoT',
    emoji: '🔌',
    status: 'Active',
    description:
      'IoT sensor integration, wireless communication protocols, and edge systems.',
    duration: '—',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'ICT Academy Class',
    category: 'Infrastructure',
    title: 'Computer Network',
    emoji: '📡',
    status: 'Active',
    description:
      'Network architecture, data transmission layers, and communication protocols.',
    duration: '—',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'ICT Academy Class',
    category: 'Hardware Class',
    title: 'Embedded System',
    emoji: '⚙️',
    status: 'Active',
    description:
      'Microcontrollers, firmware engineering, and low-level hardware integration.',
    duration: '—',
    level: 'Intermediate',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'ICT Academy Class',
    category: 'Security Class',
    title: 'Network Security (Track 2)',
    emoji: '🛡️',
    status: 'Active',
    description:
      'Advanced firewall policies, secure tunnels, and threat mitigation strategies.',
    duration: '—',
    level: 'Intermediate',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'ICT Academy Class',
    category: 'Cloud Class',
    title: 'Cloud Computing (Advanced)',
    emoji: '☁️',
    status: 'Active',
    description:
      'Advanced enterprise cloud deployment, multi-tenant architecture, and cloud management.',
    duration: '—',
    level: 'Advanced',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'ICT Academy Class',
    category: 'AI Class',
    title: 'Artificial Intelligence',
    emoji: '🧠',
    status: 'Active',
    description:
      'Machine learning models, neural networks, and applied AI problem solving.',
    duration: '—',
    level: 'Intermediate',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'ICT Academy Class',
    category: 'Advanced Class',
    title: 'Big Data',
    emoji: '📊',
    status: 'Active',
    description:
      'Distributed storage, Hadoop ecosystems, and large-scale data analytics pipelines.',
    duration: '—',
    level: 'Intermediate',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'ICT Academy Class',
    category: 'Database Class',
    title: 'OpenGauss-Database',
    emoji: '🗄️',
    status: 'Active',
    description:
      'Enterprise relational database management, SQL optimization, and database scaling.',
    duration: '—',
    level: 'Intermediate',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'ICT Academy Class',
    category: 'AI Class',
    title: 'Artificial Intelligence (AI)',
    emoji: '⚡',
    status: 'Active',
    description:
      'Advanced AI frameworks, neural architectures, and intelligent system integration.',
    duration: '—',
    level: 'Advanced',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'ICT Academy Class',
    category: 'OS Class',
    title: 'OpenEule',
    emoji: '🐧',
    status: 'Active',
    description:
      'Enterprise Linux operating system administration, kernel tuning, and server management.',
    duration: '—',
    level: 'Intermediate',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'ICT Academy Class',
    category: 'Foundation',
    title: 'Mathematics',
    emoji: '📐',
    status: 'Active',
    description:
      'Applied mathematics and linear algebra concepts for computing and algorithms.',
    duration: '—',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  /* =======================================================
     AI (Dedicated Major / Track)
  ======================================================= */

  {
    major: 'AI',
    category: 'Core Courses',
    title: 'Artificial Intelligence (AI)',
    emoji: '🤖',
    status: 'Active',
    description:
      'Neural networks, computer vision frameworks, and MindSpore practice.',
    duration: '—',
    level: 'Intermediate',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'AI',
    category: 'Core Courses',
    title: 'Data Structure',
    emoji: '🗂️',
    status: 'Active',
    description:
      'Essential data storage, search algorithms, and optimization techniques.',
    duration: '—',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'AI',
    category: 'AI',
    title: 'Artificial Intelligence Fundamentals',
    emoji: '🤖',
    description:
      'Build a foundation in Artificial Intelligence concepts, technologies, and applications.',
    duration: '48 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'AI',
    category: 'AI',
    title: 'General Knowledge of Intelligent Cultural Computing',
    emoji: '🧠',
    description:
      'Explore intelligent computing concepts and their applications in cultural and digital environments.',
    duration: '32 hours',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'AI',
    category: 'AI',
    title: 'Huawei AI Processor Application Development',
    emoji: '⚡',
    description:
      'Learn application development concepts for Huawei AI processor technologies.',
    duration: '64 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'AI',
    category: 'AI',
    title: 'Artificial Intelligence: Principles and Applications',
    emoji: '🧠',
    description:
      'Study fundamental AI principles and their real-world applications.',
    duration: '32 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'AI',
    category: 'AI',
    title: 'Exploring the Intelligent World 2030',
    emoji: '🌍',
    description:
      'Explore future intelligent technologies and the evolution of the digital world.',
    duration: '4 hours',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'AI',
    category: 'AI',
    title: 'HCCDA-AI Course',
    emoji: '🤖',
    description:
      'Explore Huawei Cloud AI technologies, concepts, and practical applications.',
    duration: '24 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'AI',
    category: 'AI',
    title: 'Overview of AI',
    emoji: '🤖',
    description:
      'A short introduction to Artificial Intelligence concepts and applications.',
    duration: '2 hours',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'AI',
    category: 'AI',
    title: 'Search and AI',
    emoji: '🔎',
    description:
      'Explore the relationship between search technologies and Artificial Intelligence.',
    duration: '6 hours',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'AI',
    category: 'Certification',
    title: 'HCIA-AI V4.0 Course',
    emoji: '🎓',
    description:
      'Huawei certification training focused on Artificial Intelligence technologies.',
    duration: '32 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'AI',
    category: 'AI',
    title: 'HCIA-AI Solution V1.0 Course',
    emoji: '🤖',
    description:
      'Learn Huawei AI solution concepts and intelligent technology applications.',
    duration: '18 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'AI',
    category: 'AI',
    title: 'Artificial Intelligence Technology and Applications',
    emoji: '🧠',
    description:
      'Explore Artificial Intelligence technologies, practical applications, and intelligent solutions.',
    duration: '64 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'AI',
    category: 'AI',
    title: 'Overview of AI (Arabic)',
    emoji: '🤖',
    description:
      'Arabic-language introduction to Artificial Intelligence concepts.',
    duration: '2 hours',
    level: 'Beginner',
    language: 'Arabic',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'AI',
    category: 'AI',
    title: 'Search and AI (Arabic)',
    emoji: '🔎',
    description:
      'Arabic-language course exploring search technologies and Artificial Intelligence.',
    duration: '6 hours',
    level: 'Beginner',
    language: 'Arabic',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'AI',
    category: 'Labs',
    title: 'Artificial Intelligence Fundamentals Modular Experiments',
    emoji: '🧪',
    description:
      'Hands-on Artificial Intelligence experiments designed around modular practical learning.',
    duration: '34 hours',
    level: 'Not specified',
    labs: '14 Labs',
    link: HUAWEI_PORTAL,
  },

  /* =======================================================
     COMPUTER SCIENCE AND TECHNOLOGY
  ======================================================= */

  {
    major: 'Computer Science and Technology',
    category: 'Project Management',
    title: 'ICT Project Management Essentials',
    emoji: '📋',
    description:
      'Learn essential project management concepts and practices for ICT projects.',
    duration: '8 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Networking',
    title: 'Network Architecture and Technical Practices',
    emoji: '🌐',
    description:
      'Study network architecture and apply technical networking practices.',
    duration: '80 hours',
    level: 'Intermediate',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: '5G',
    title: '5G Mobile Network Deployment and Industry Applications',
    emoji: '📶',
    description:
      'Explore 5G mobile network deployment technologies and their industry applications.',
    duration: '48 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Operating Systems',
    title: 'Deployment and Maintenance of the openEuler Operating System',
    emoji: '🐧',
    description:
      'Learn deployment, configuration, administration, and maintenance of openEuler.',
    duration: '64 hours',
    level: 'Intermediate',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Database',
    title: 'openGauss Database Technology and Applications',
    emoji: '🗄️',
    description:
      'Explore openGauss database technologies, architecture, and practical applications.',
    duration: '64 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Programming',
    title: 'Cangjie Programming',
    emoji: '💻',
    description:
      'Learn the fundamentals of Cangjie programming and modern software development.',
    duration: '56 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Networking',
    title: 'F5G All-Optical Campus Network Technology and Project Practice',
    emoji: '🔗',
    description:
      'Study F5G all-optical campus network technologies and project implementation.',
    duration: '64 hours',
    level: 'Intermediate',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Database',
    title: 'Database Principles and Applications: Based on openGauss',
    emoji: '🗃️',
    description:
      'Learn database principles and practical database applications using openGauss.',
    duration: '32 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Networking',
    title: 'Computer Networks V1.0',
    emoji: '🌐',
    description:
      'Learn computer networking concepts, technologies, and communication principles.',
    duration: '64 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Operating Systems',
    title:
      'Operating System Basics and Practice A Hands-on Approach with openEuler',
    emoji: '🐧',
    description:
      'Learn operating system fundamentals through practical openEuler-based exercises.',
    duration: '32 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Cloud',
    title: 'General Knowledge of Cloud Computing',
    emoji: '☁️',
    description:
      'Understand the fundamentals and key concepts of cloud computing.',
    duration: '2 hours',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Career',
    title: 'Rock your Profile: Boost Your Career with LinkedIn',
    emoji: '💼',
    description:
      'Learn how to improve your professional LinkedIn profile and strengthen your career presence.',
    duration: '2 hours',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Cloud',
    title: 'Development and Basic Concepts of Cloud Computing',
    emoji: '☁️',
    description:
      'Introduction to cloud computing development and core concepts.',
    duration: '2 hours',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Cloud',
    title: 'HCCDA-Tech Essentials Course',
    emoji: '☁️',
    description:
      'Learn essential technical concepts for Huawei Cloud and digital technologies.',
    duration: '24 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Cloud',
    title: 'HCCDA-Cloud Native Course',
    emoji: '☁️',
    description:
      'Explore cloud-native concepts, technologies, and modern application architectures.',
    duration: '32 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Networking',
    title: 'General Knowledge of Computer Networks',
    emoji: '🌐',
    description:
      'A beginner-friendly introduction to computer network concepts.',
    duration: '2 hours',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: '5G',
    title: "5G Basics: What it's all about",
    emoji: '📶',
    description:
      'Understand the fundamentals of 5G technology and its key characteristics.',
    duration: '2 hours',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Networking',
    title: 'Data Communication and Network Technology',
    emoji: '📡',
    description:
      'Study data communication systems, networking technologies, and protocols.',
    duration: '128 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Foundation',
    title: 'Math Basics',
    emoji: '📐',
    description:
      'Build essential mathematics foundations for computing and technical studies.',
    duration: '4 hours',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Programming',
    title: 'Python Programming Basics',
    emoji: '🐍',
    description:
      'Learn Python programming fundamentals and basic problem-solving techniques.',
    duration: '4 hours',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Digital Power',
    title: 'Digital Power',
    emoji: '⚡',
    description:
      'Explore the fundamentals of digital power technologies and applications.',
    duration: '2 hours',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Networking',
    title: 'Principles and Applications of WLAN',
    emoji: '📶',
    description:
      'Learn WLAN principles, wireless technologies, and practical applications.',
    duration: '64 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Certification',
    title: 'HCIA-CT V1.0 Course',
    emoji: '🎓',
    description:
      'Huawei certification-oriented training covering the CT technology domain.',
    duration: '32 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Database',
    title: 'HCIA-openGauss V2.0 Course',
    emoji: '🗄️',
    description:
      'Certification training focused on openGauss database technologies.',
    duration: '32 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Labs',
    title: 'Database System Modular Experiments',
    emoji: '🧪',
    description:
      'Hands-on database system experiments covering practical database concepts.',
    duration: '50.3 hours',
    level: 'Not specified',
    labs: '15 Labs',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Labs',
    title: 'Computer Networks Modular Experiments',
    emoji: '🧪',
    description:
      'Practical computer networking experiments covering real networking concepts.',
    duration: '78 hours',
    level: 'Not specified',
    labs: '30 Labs',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Labs',
    title: 'Network Security Modular Experiments',
    emoji: '🧪',
    description:
      'Hands-on experiments focused on network security concepts and implementation.',
    duration: '66 hours',
    level: 'Not specified',
    labs: '30 Labs',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Certification',
    title: 'HCIA-IT V1.0 Course',
    emoji: '🎓',
    description:
      'Huawei certification course covering essential IT technologies.',
    duration: '32 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Operating Systems',
    title: 'HCIA-openEuler V2.0 Course',
    emoji: '🐧',
    description:
      'Certification training focused on the openEuler operating system.',
    duration: '48 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Computing',
    title: 'HCIA-Computing V3.0 Course',
    emoji: '🖥️',
    description:
      'Certification training covering Huawei computing technologies.',
    duration: '32 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Data',
    title: 'Data Management and Analytics',
    emoji: '📊',
    description:
      'Introduction to data management concepts and analytics.',
    duration: '2 hours',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Security',
    title: 'Network Security',
    emoji: '🔐',
    description:
      'Introduction to fundamental network security concepts and practices.',
    duration: '8 hours',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Cloud',
    title: 'Development and Basic Concepts of Cloud Computing (Arabic)',
    emoji: '☁️',
    description:
      'Arabic-language introduction to cloud computing development and concepts.',
    duration: '2 hours',
    level: 'Beginner',
    language: 'Arabic',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Competition',
    title:
      'Huawei ICT Competition 2023-2024 Practice Competition Network Track',
    emoji: '🏆',
    description:
      'Practice competition content for the Huawei ICT Competition Network Track.',
    duration: '16 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Competition',
    title:
      'Huawei ICT Competition 2023-2024 Practice Competition Cloud Track',
    emoji: '🏆',
    description:
      'Practice competition content for the Huawei ICT Competition Cloud Track.',
    duration: '16 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Competition',
    title:
      'Huawei ICT Competition 2023-2024 Practice Competition Computing Track',
    emoji: '🏆',
    description:
      'Practice competition content for the Huawei ICT Competition Computing Track.',
    duration: '16 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Programming',
    title: 'Algorithm and Program Design',
    emoji: '💻',
    description:
      'Introduction to algorithms, program design, and computational problem solving.',
    duration: '2 hours',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Cloud',
    title: 'Cloud Advanced: Architecture and Technologies',
    emoji: '☁️',
    description:
      'Explore advanced cloud architecture concepts and technologies.',
    duration: '2 hours',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: '5G',
    title: '5G Network Architecture and Key Technologies',
    emoji: '📶',
    description:
      'Introduction to 5G network architecture and its key technologies.',
    duration: '2 hours',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: '5G',
    title: '5G Network and Applications',
    emoji: '📶',
    description:
      'Explore 5G networks and their practical applications.',
    duration: '32 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Data',
    title: 'Data Management and Analytics (Arabic)',
    emoji: '📊',
    description:
      'Arabic-language introduction to data management and analytics.',
    duration: '2 hours',
    level: 'Beginner',
    language: 'Arabic',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Data',
    title: 'Information Representation and Data Organization (Arabic)',
    emoji: '🗂️',
    description:
      'Arabic-language introduction to information representation and data organization.',
    duration: '2 hours',
    level: 'Beginner',
    language: 'Arabic',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Networking',
    title: 'General Knowledge of Computer Networks (Arabic)',
    emoji: '🌐',
    description:
      'Arabic-language introduction to fundamental computer networking concepts.',
    duration: '2 hours',
    level: 'Beginner',
    language: 'Arabic',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Networking',
    title: 'Data Communication and Network Technology (Arabic)',
    emoji: '📡',
    description:
      'Arabic-language course covering data communication and networking technologies.',
    duration: '128 hours',
    level: 'Novice',
    language: 'Arabic',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Database',
    title: 'HCCDA-GaussDB Course',
    emoji: '🗄️',
    description:
      'Explore GaussDB concepts and Huawei database technologies.',
    duration: '32 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Database',
    title: 'HCIA-openGauss V1.0 Course (Offline Date 2026-08-28)',
    emoji: '🗄️',
    description:
      'Huawei certification training focused on openGauss database technology.',
    duration: '16 hours',
    level: 'Novice',
    offlineDate: '2026-08-28',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Cloud',
    title: 'HCIA-Cloud Computing V5.5 Course (Arabic)',
    emoji: '☁️',
    description:
      'Arabic-language Huawei certification training in cloud computing.',
    duration: '32 hours',
    level: 'Novice',
    language: 'Arabic',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Storage',
    title: 'HCIA-Storage V5.0 Course (Arabic)',
    emoji: '💾',
    description:
      'Arabic-language Huawei certification training focused on storage technologies.',
    duration: '32 hours',
    level: 'Novice',
    language: 'Arabic',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Networking',
    title: 'HCIA-Datacom V1.0 Course (Arabic)',
    emoji: '🌐',
    description:
      'Arabic-language Huawei certification training in data communication.',
    duration: '64 hours',
    level: 'Novice',
    language: 'Arabic',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Security',
    title: 'HCIA-Security V4.0 Course (Arabic)',
    emoji: '🔐',
    description:
      'Arabic-language Huawei certification training focused on cybersecurity.',
    duration: '32 hours',
    level: 'Novice',
    language: 'Arabic',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: '5G',
    title: 'HCIA-5G V2.0 Course (Arabic)',
    emoji: '📶',
    description:
      'Arabic-language Huawei certification training in 5G technologies.',
    duration: '32 hours',
    level: 'Novice',
    language: 'Arabic',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Cloud',
    title: 'HCIA-Cloud Service V3.5 Course (Arabic)',
    emoji: '☁️',
    description:
      'Arabic-language Huawei certification training focused on cloud services.',
    duration: '32 hours',
    level: 'Novice',
    language: 'Arabic',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Data Center',
    title: 'HCIA-Data Center Facility V2.0 Course',
    emoji: '🏢',
    description:
      'Learn data center facility technologies and infrastructure fundamentals.',
    duration: '32 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Storage',
    title: 'HCIA-Storage V5.0 Course',
    emoji: '💾',
    description:
      'Huawei certification training focused on enterprise storage technologies.',
    duration: '32 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Security',
    title: 'HCIA-Security V4.0 Course',
    emoji: '🔐',
    description:
      'Huawei certification training focused on security technologies and solutions.',
    duration: '32 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Networking',
    title: 'HCIA-Datacom V1.0 Course (Offline Date 2026-09-30)',
    emoji: '🌐',
    description:
      'Huawei certification training in Datacom with an offline session date.',
    duration: '64 hours',
    level: 'Novice',
    offlineDate: '2026-09-30',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: '5G',
    title: 'HCIA-5G V2.0 Course',
    emoji: '📶',
    description:
      'Huawei certification training focused on 5G technologies and networks.',
    duration: '32 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Networking',
    title: 'HCIA-WLAN V3.0 Course (Offline Date 2026-09-30)',
    emoji: '📶',
    description:
      'Huawei WLAN certification training covering wireless networking technologies.',
    duration: '32 hours',
    level: 'Novice',
    offlineDate: '2026-09-30',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Cloud',
    title: 'HCIA-Cloud Computing V5.5 Course',
    emoji: '☁️',
    description:
      'Huawei certification training focused on cloud computing technologies.',
    duration: '32 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Cloud',
    title: 'HCIA-Cloud Service V3.5 Course',
    emoji: '☁️',
    description:
      'Huawei certification training focused on cloud service technologies.',
    duration: '32 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Data',
    title: 'HCIA-Big Data V3.5 Course',
    emoji: '📊',
    description:
      'Huawei certification training covering big data technologies and solutions.',
    duration: '32 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Cloud',
    title: 'HCCDP-Cloud Migration Course',
    emoji: '☁️',
    description:
      'Learn cloud migration concepts, strategies, and implementation practices.',
    duration: '32 hours',
    level: 'Intermediate',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Cloud',
    title: 'HCCDP-Solution Architectures Course',
    emoji: '🏗️',
    description:
      'Explore solution architecture design and enterprise cloud architecture.',
    duration: '56 hours',
    level: 'Intermediate',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Networking',
    title: 'HCIP-Datacom Core Technology V1.0 Course',
    emoji: '🌐',
    description:
      'Advanced Datacom training focused on core networking technologies.',
    duration: '64 hours',
    level: 'Intermediate',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Operating Systems',
    title: 'HCIA-openEuler V1.0 Course',
    emoji: '🐧',
    description:
      'Training focused on Huawei openEuler operating system technologies.',
    duration: '32 hours',
    level: 'Intermediate',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Networking',
    title:
      'HCIP-Datacom-Network Automation Developer V1.0 Course',
    emoji: '⚙️',
    description:
      'Learn network automation development and programmable networking concepts.',
    duration: '32 hours',
    level: 'Intermediate',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Database',
    title: 'HCIE-openGauss V1.0 Course',
    emoji: '🗄️',
    description:
      'Advanced openGauss database training for expert-level development.',
    duration: '30 hours',
    level: 'Advanced',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Database',
    title: 'HCIP-openGauss V1.0 Course',
    emoji: '🗄️',
    description:
      'Intermediate openGauss database technologies and professional practices.',
    duration: '20 hours',
    level: 'Intermediate',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Operating Systems',
    title: 'HCIE-openEuler V1.0 Course',
    emoji: '🐧',
    description:
      'Advanced openEuler operating system training for expert-level learners.',
    duration: '24 hours',
    level: 'Advanced',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science and Technology',
    category: 'Data',
    title: 'Information Representation and Data Organization',
    emoji: '🗂️',
    description:
      'Introduction to information representation and data organization concepts.',
    duration: '2 hours',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  /* =======================================================
     COMPUTER SCIENCE
  ======================================================= */

  {
    major: 'Computer Science',
    category: 'Core Courses',
    title: 'Operating System',
    emoji: '💻',
    status: 'Active',
    description:
      'Master kernel concepts, process management, memory allocation, and concurrency.',
    duration: '—',
    level: 'Intermediate',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science',
    category: 'Core Courses',
    title: 'Programming',
    emoji: '⚡',
    status: 'Active',
    description:
      'Programming paradigms, algorithms, and efficient software implementation.',
    duration: '—',
    level: 'Intermediate',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Computer Science',
    category: 'Practical Courses',
    title: 'Comprehensive Training',
    emoji: '🛠️',
    status: 'Active',
    description:
      'Hands-on system training and real-world IT scenario deployment.',
    duration: '—',
    level: 'Intermediate',
    link: HUAWEI_PORTAL,
  },

  /* =======================================================
     SOFTWARE ENGINEERING
  ======================================================= */

  {
    major: 'Software Engineering',
    category: 'Core Courses',
    title: 'Software Engineering Principles',
    emoji: '📐',
    status: 'Active',
    description:
      'Agile development lifecycles, project management, and design patterns.',
    duration: '—',
    level: 'Intermediate',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Software Engineering',
    category: 'Practical Courses',
    title: 'Software Test and Quality',
    emoji: '🧪',
    status: 'Active',
    description:
      'Automated testing, quality assurance, and debugging pipelines.',
    duration: '—',
    level: 'Intermediate',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Software Engineering',
    category: 'Programming',
    title: 'Cangjie Programming',
    emoji: '💻',
    description:
      'Learn the fundamentals of Cangjie programming and modern software development.',
    duration: '56 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Software Engineering',
    category: 'Programming',
    title: 'Python Programming Basics',
    emoji: '🐍',
    description:
      'Learn Python programming fundamentals and basic problem-solving techniques.',
    duration: '4 hours',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Software Engineering',
    category: 'Programming',
    title: 'Algorithm and Program Design',
    emoji: '💻',
    description:
      'Introduction to algorithms, program design, and computational problem solving.',
    duration: '2 hours',
    level: 'Beginner',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Software Engineering',
    category: 'Project Management',
    title: 'ICT Project Management Essentials',
    emoji: '📋',
    description:
      'Learn essential project management concepts and practices for ICT projects.',
    duration: '8 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Software Engineering',
    category: 'Database',
    title: 'openGauss Database Technology and Applications',
    emoji: '🗄️',
    description:
      'Explore openGauss database technologies, architecture, and practical applications.',
    duration: '64 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Software Engineering',
    category: 'Database',
    title: 'Database Principles and Applications: Based on openGauss',
    emoji: '🗃️',
    description:
      'Learn database principles and practical database applications using openGauss.',
    duration: '32 hours',
    level: 'Novice',
    link: HUAWEI_PORTAL,
  },

  {
    major: 'Software Engineering',
    category: 'Networking',
    title:
      'HCIP-Datacom-Network Automation Developer V1.0 Course',
    emoji: '⚙️',
    description:
      'Learn network automation development and programmable networking concepts.',
    duration: '32 hours',
    level: 'Intermediate',
    link: HUAWEI_PORTAL,
  },
];

/* =========================================================
   CONSTANTS
========================================================= */

const TOTAL_COURSES = HUAWEI_COURSES.length;

const MAJORS = [
  'ICT Academy Class',
  'Computer Science and Technology',
  'AI',
  'Computer Science',
  'Software Engineering',
  'IoT Engineering',
];

const LEVELS = [
  'All Levels',
  'Beginner',
  'Novice',
  'Intermediate',
  'Advanced',
  'Not specified',
];

/* =========================================================
   CATEGORY ICONS
========================================================= */

const CATEGORY_ICONS = {
  'Core Class': '◈',
  'Security Class': '⌁',
  'IoT Class': '⌘',
  'Cloud Class': '☁',
  'AI Class': '✦',
  'Hardware Class': '⚙',
  Infrastructure: '◉',
  'Advanced Class': '◆',
  'Database Class': '▣',
  'OS Class': '◌',
  Foundation: '△',

  'Core Courses': '◈',
  'Practical Courses': '⚒',
  'College Courses': '▤',
  'Certification Courses': '✓',

  AI: '✦',
  Networking: '◎',
  Cloud: '☁',
  Database: '▣',
  'Operating Systems': '◌',
  Programming: '⌘',
  Security: '⌁',
  'Project Management': '◫',
  '5G': '◉',
  Labs: '🧪',
  Certification: '✓',
  Data: '▦',
  Computing: '▰',
  Competition: '🏆',
  Career: '✦',
  Storage: '▤',
  'Data Center': '▥',
  'Digital Power': '⚡',
};

/* =========================================================
   COURSE CARD
========================================================= */

function CourseCard({ course, index }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{
        duration: 0.28,
        delay: Math.min(index * 0.025, 0.18),
      }}
      whileHover={{ y: -4 }}
      className="
        group relative flex min-h-[300px] flex-col
        overflow-hidden rounded-2xl
        border border-white/[0.08]
        bg-[#0b1324]
        p-4 sm:p-5
        transition-all duration-300
        hover:border-red-500/35
        hover:bg-[#0d172b]
        hover:shadow-[0_18px_50px_rgba(0,0,0,0.28)]
      "
    >
      <div
        className="
          pointer-events-none absolute -right-16 -top-16
          h-32 w-32 rounded-full
          bg-red-600/10 blur-3xl
          opacity-70
          transition-opacity duration-300
          group-hover:opacity-100
        "
      />

      <div className="relative z-10">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div
            className="
              flex h-11 w-11 shrink-0 items-center justify-center
              rounded-xl border border-white/10
              bg-white/[0.045]
              text-xl
            "
          >
            {course.emoji}
          </div>

          <div className="flex max-w-[70%] flex-wrap justify-end gap-1.5">
            {course.category && (
              <span
                className="
                  rounded-full border border-red-500/15
                  bg-red-500/[0.08]
                  px-2.5 py-1
                  text-[9px] font-semibold uppercase
                  tracking-wide text-red-300
                "
              >
                {CATEGORY_ICONS[course.category] || '•'}{' '}
                {course.category}
              </span>
            )}

            {course.language && (
              <span
                className="
                  rounded-full border border-blue-500/15
                  bg-blue-500/[0.08]
                  px-2.5 py-1
                  text-[9px] font-semibold
                  text-blue-300
                "
              >
                {course.language}
              </span>
            )}
          </div>
        </div>

        <h3
          className="
            mb-2
            line-clamp-3
            min-h-[72px]
            text-[15px] font-bold leading-6
            text-white
            transition-colors
            group-hover:text-red-300
            sm:text-base
          "
        >
          {course.title}
        </h3>

        <p
          className="
            line-clamp-3
            text-[12px]
            leading-5
            text-slate-400
          "
        >
          {course.description}
        </p>
      </div>

      <div className="relative z-10 mt-auto pt-5">
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div
            className="
              rounded-lg border border-white/[0.06]
              bg-white/[0.025] px-2.5 py-2
            "
          >
            <span className="block text-[8px] uppercase tracking-wider text-slate-600">
              Duration
            </span>

            <span className="mt-0.5 block truncate text-[10px] font-semibold text-slate-300">
              {course.duration || '—'}
            </span>
          </div>

          <div
            className="
              rounded-lg border border-white/[0.06]
              bg-white/[0.025] px-2.5 py-2
            "
          >
            <span className="block text-[8px] uppercase tracking-wider text-slate-600">
              Level
            </span>

            <span className="mt-0.5 block truncate text-[10px] font-semibold text-slate-300">
              {course.level || '—'}
            </span>
          </div>
        </div>

        {(course.labs || course.offlineDate) && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {course.labs && (
              <span
                className="
                  rounded-lg border border-purple-500/15
                  bg-purple-500/[0.06]
                  px-2 py-1
                  text-[9px] font-medium text-purple-300
                "
              >
                🧪 {course.labs}
              </span>
            )}

            {course.offlineDate && (
              <span
                className="
                  rounded-lg border border-amber-500/15
                  bg-amber-500/[0.06]
                  px-2 py-1
                  text-[9px] font-medium text-amber-300
                "
              >
                📅 Offline: {course.offlineDate}
              </span>
            )}
          </div>
        )}

        <a
          href={course.link || HUAWEI_PORTAL}
          target="_blank"
          rel="noopener noreferrer"
          className="
            flex min-h-[44px]
            w-full items-center justify-between
            rounded-xl
            border border-white/10
            bg-white/[0.045]
            px-3.5
            text-[11px] font-semibold
            text-slate-100
            transition-all duration-200
            hover:border-red-500/40
            hover:bg-red-600
            active:scale-[0.98]
          "
          aria-label={`Open ${course.title}`}
        >
          <span>View Course</span>

          <span
            className="
              flex h-6 w-6 items-center justify-center
              rounded-full bg-white/10
              transition-transform
              group-hover:translate-x-0.5
            "
          >
            ↗
          </span>
        </a>
      </div>
    </motion.article>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function HuaweiDashboardPage() {
  const [selectedMajor, setSelectedMajor] =
    useState('ICT Academy Class');

  const [selectedCategory, setSelectedCategory] =
    useState('All');

  const [selectedLevel, setSelectedLevel] =
    useState('All Levels');

  const [searchQuery, setSearchQuery] = useState('');

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  /* =======================================================
     COURSES FOR SELECTED TRACK
  ======================================================= */

  const majorCourses = useMemo(() => {
    return HUAWEI_COURSES.filter(
      (course) => course.major === selectedMajor
    );
  }, [selectedMajor]);

  /* =======================================================
     CATEGORIES
  ======================================================= */

  const categories = useMemo(() => {
    return [
      'All',
      ...new Set(
        majorCourses
          .map((course) => course.category)
          .filter(Boolean)
      ),
    ];
  }, [majorCourses]);

  /* =======================================================
     FILTERED COURSES
  ======================================================= */

  const filteredCourses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return majorCourses.filter((course) => {
      const searchableText = [
        course.title,
        course.description,
        course.category,
        course.level,
        course.duration,
        course.language,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesCategory =
        selectedCategory === 'All' ||
        course.category === selectedCategory;

      const matchesLevel =
        selectedLevel === 'All Levels' ||
        course.level === selectedLevel;

      const matchesSearch =
        !query || searchableText.includes(query);

      return (
        matchesCategory &&
        matchesLevel &&
        matchesSearch
      );
    });
  }, [
    majorCourses,
    selectedCategory,
    selectedLevel,
    searchQuery,
  ]);

  /* =======================================================
     RESET FILTERS WHEN TRACK CHANGES
  ======================================================= */

  useEffect(() => {
    setSelectedCategory('All');
    setSelectedLevel('All Levels');
    setSearchQuery('');
  }, [selectedMajor]);

  /* =======================================================
     ESCAPE TO CLOSE AI MODAL
  ======================================================= */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsAiModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, []);

  /* =======================================================
     AI ADVISOR
  ======================================================= */

  const handleAskGemini = async (event) => {
    event.preventDefault();

    if (!aiPrompt.trim() || isAiLoading) return;

    setIsAiLoading(true);
    setAiResponse('');

    try {
      const response = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          major: selectedMajor,
          courses: majorCourses,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || 'AI request failed'
        );
      }

      setAiResponse(
        data?.text ||
          "Sorry, I couldn't generate a response."
      );
    } catch (error) {
      console.error(error);

      setAiResponse(
        'Unable to connect to the AI advisor right now. Please try again.'
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  /* =======================================================
     TRACK COURSE COUNT
  ======================================================= */

  const trackCount = MAJORS.length;

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main
      className="
        min-h-[100dvh]
        bg-[#030811]
        px-2 py-2
        text-slate-100
        sm:px-4 sm:py-4
        lg:px-6 lg:py-6
        font-sans
      "
    >
      {/* Ambient background */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="
            absolute -left-32 -top-32
            h-72 w-72
            rounded-full
            bg-red-600/[0.06]
            blur-[100px]
          "
        />

        <div
          className="
            absolute -bottom-32 -right-32
            h-96 w-96
            rounded-full
            bg-blue-600/[0.04]
            blur-[120px]
          "
        />
      </div>

      <div
        className="
          relative mx-auto flex
          min-h-[calc(100dvh-1rem)]
          w-full max-w-[1500px]
          flex-col overflow-hidden
          rounded-2xl
          border border-white/[0.08]
          bg-[#080e1b]
          shadow-[0_25px_80px_rgba(0,0,0,0.45)]
          sm:min-h-[calc(100dvh-2rem)]
          sm:rounded-3xl
          lg:min-h-[calc(100dvh-3rem)]
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <header
          className="
            sticky top-0 z-40
            border-b border-white/[0.07]
            bg-[#09111f]/90
            px-3 py-3
            backdrop-blur-xl
            sm:px-5 sm:py-3.5
            lg:px-7
          "
        >
          <div className="flex items-center justify-between gap-3">
            {/* Brand */}

            <div className="flex min-w-0 items-center gap-2.5">
              <div
                className="
                  flex h-9 w-9 shrink-0
                  items-center justify-center
                  rounded-xl
                  bg-gradient-to-br
                  from-red-600 to-rose-500
                  text-[10px] font-black
                  text-white
                  shadow-[0_8px_25px_rgba(220,38,38,0.25)]
                  sm:h-10 sm:w-10 sm:text-xs
                "
              >
                HW
              </div>

              <div className="min-w-0">
                <p
                  className="
                    truncate
                    text-[11px] font-bold
                    text-white
                    sm:text-sm
                  "
                >
                  Huawei ICT Academy
                </p>

                <p
                  className="
                    truncate
                    text-[9px]
                    font-medium
                    text-red-400
                    sm:text-[10px]
                  "
                >
                  UTB Student Learning Hub
                </p>
              </div>
            </div>

            {/* Header actions */}

            <div className="flex shrink-0 items-center gap-1.5">
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="
                  flex h-9 items-center
                  gap-1.5 rounded-xl
                  border border-red-500/20
                  bg-red-500/[0.08]
                  px-2.5
                  text-[10px] font-semibold
                  text-red-300
                  transition
                  hover:bg-red-500/15
                  active:scale-95
                  sm:px-3
                "
                aria-label="Open AI Advisor"
              >
                <span>✦</span>

                <span className="hidden sm:inline">
                  AI Advisor
                </span>
              </button>

              <Link
                href="/"
                className="
                  flex h-9 items-center
                  rounded-xl
                  border border-white/10
                  bg-white/[0.035]
                  px-2.5
                  text-[10px]
                  font-medium
                  text-slate-300
                  transition
                  hover:border-white/20
                  hover:text-white
                  active:scale-95
                  sm:px-3
                "
              >
                Exit
                <span className="ml-1">→</span>
              </Link>
            </div>
          </div>
        </header>

        {/* =================================================
            TRACK NAVIGATION
        ================================================= */}

        <section
          className="
            border-b border-white/[0.07]
            bg-[#060c17]/95
          "
        >
          <div
            className="
              flex gap-2 overflow-x-auto
              px-3 py-2.5
              scrollbar-none
              sm:px-5 sm:py-3
              lg:px-7
            "
          >
            {MAJORS.map((major) => {
              const active = selectedMajor === major;

              const count = HUAWEI_COURSES.filter(
                (course) => course.major === major
              ).length;

              return (
                <button
                  key={major}
                  onClick={() =>
                    setSelectedMajor(major)
                  }
                  className={`
                    flex min-h-[40px]
                    shrink-0 items-center gap-2
                    whitespace-nowrap
                    rounded-xl
                    border
                    px-3.5
                    text-[10px]
                    font-semibold
                    transition-all duration-200
                    active:scale-[0.97]
                    sm:px-4
                    sm:text-[11px]
                    ${
                      active
                        ? `
                          border-red-500/35
                          bg-red-600
                          text-white
                          shadow-[0_8px_25px_rgba(220,38,38,0.18)]
                        `
                        : `
                          border-white/[0.07]
                          bg-white/[0.025]
                          text-slate-400
                          hover:border-white/15
                          hover:bg-white/[0.05]
                          hover:text-white
                        `
                    }
                  `}
                >
                  <span>{major}</span>

                  <span
                    className={`
                      rounded-full px-1.5 py-0.5
                      text-[8px]
                      ${
                        active
                          ? 'bg-white/15 text-white'
                          : 'bg-white/[0.05] text-slate-500'
                      }
                    `}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* =================================================
            CONTENT
        ================================================= */}

        <div
          className="
            flex-1
            px-3 py-4
            sm:px-5 sm:py-6
            lg:px-7 lg:py-7
          "
        >
          {/* Hero */}

          <div className="mb-6">
            <div
              className="
                flex flex-col gap-5
                lg:flex-row
                lg:items-end
                lg:justify-between
              "
            >
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="
                      h-1.5 w-1.5
                      rounded-full
                      bg-red-500
                      shadow-[0_0_10px_rgba(239,68,68,0.8)]
                    "
                  />

                  <span
                    className="
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-red-400
                    "
                  >
                    Explore Courses
                  </span>
                </div>

                <h1
                  className="
                    text-2xl font-bold
                    tracking-tight
                    text-white
                    sm:text-3xl
                    lg:text-4xl
                  "
                >
                  Find your next
                  <span className="text-red-400">
                    {' '}
                    learning path
                  </span>
                </h1>

                <p
                  className="
                    mt-2
                    max-w-2xl
                    text-[11px]
                    leading-5
                    text-slate-500
                    sm:text-xs
                  "
                >
                  Discover Huawei courses,
                  certifications, technical training,
                  and practical learning experiences.
                </p>
              </div>

              {/* Stats */}

              <div
                className="
                  grid grid-cols-2
                  gap-2
                  sm:flex
                "
              >
                <div
                  className="
                    rounded-xl
                    border border-white/[0.08]
                    bg-white/[0.035]
                    px-4 py-2.5
                  "
                >
                  <span
                    className="
                      block
                      text-[8px]
                      uppercase
                      tracking-wider
                      text-slate-500
                    "
                  >
                    Courses
                  </span>

                  <span
                    className="
                      text-lg
                      font-bold
                      text-white
                    "
                  >
                    {TOTAL_COURSES}
                  </span>
                </div>

                <div
                  className="
                    rounded-xl
                    border border-white/[0.08]
                    bg-white/[0.035]
                    px-4 py-2.5
                  "
                >
                  <span
                    className="
                      block
                      text-[8px]
                      uppercase
                      tracking-wider
                      text-slate-500
                    "
                  >
                    Learning Tracks
                  </span>

                  <span
                    className="
                      text-lg
                      font-bold
                      text-white
                    "
                  >
                    {trackCount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SEARCH */}

          <div className="mb-4">
            <div className="relative">
              <span
                className="
                  pointer-events-none
                  absolute left-3.5 top-1/2
                  -translate-y-1/2
                  text-slate-500
                "
              >
                🔎
              </span>

              <input
                type="search"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                placeholder="Search courses, topics, technologies..."
                className="
                  h-12 w-full
                  rounded-xl
                  border border-white/[0.08]
                  bg-[#060c17]
                  pl-10 pr-10
                  text-xs
                  text-white
                  outline-none
                  placeholder:text-slate-600
                  transition
                  focus:border-red-500/40
                  focus:ring-2
                  focus:ring-red-500/10
                "
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="
                    absolute right-2.5 top-1/2
                    flex h-7 w-7
                    -translate-y-1/2
                    items-center justify-center
                    rounded-lg
                    bg-white/[0.05]
                    text-xs text-slate-400
                    hover:text-white
                  "
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* TRACK TITLE + COUNT */}

          <div
            className="
              mb-4
              flex flex-col gap-2
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div>
              <h2
                className="
                  text-base font-bold
                  text-white
                  sm:text-lg
                "
              >
                {selectedMajor}
              </h2>

              <p
                className="
                  mt-0.5
                  text-[10px]
                  text-slate-600
                "
              >
                Courses designed for this
                learning track.
              </p>
            </div>

            <div
              className="
                self-start
                rounded-lg
                border border-white/[0.07]
                bg-white/[0.025]
                px-3 py-1.5
                text-[9px]
                text-slate-400
              "
            >
              Showing{' '}
              <span className="font-bold text-white">
                {filteredCourses.length}
              </span>{' '}
              of {majorCourses.length}
            </div>
          </div>

          {/* CATEGORY FILTER */}

          <div
            className="
              mb-3
              flex gap-2
              overflow-x-auto
              scrollbar-none
              pb-1
            "
          >
            {categories.map((category) => {
              const active =
                selectedCategory === category;

              return (
                <button
                  key={category}
                  onClick={() =>
                    setSelectedCategory(category)
                  }
                  className={`
                    flex min-h-[34px]
                    shrink-0 items-center gap-1.5
                    rounded-lg
                    border
                    px-3
                    text-[9px]
                    font-semibold
                    transition
                    active:scale-95
                    ${
                      active
                        ? `
                          border-white/15
                          bg-white/10
                          text-white
                        `
                        : `
                          border-transparent
                          bg-transparent
                          text-slate-500
                          hover:bg-white/[0.035]
                          hover:text-slate-300
                        `
                    }
                  `}
                >
                  {category !== 'All' && (
                    <span>
                      {CATEGORY_ICONS[category] || '•'}
                    </span>
                  )}

                  {category}
                </button>
              );
            })}
          </div>

          {/* LEVEL FILTER */}

          <div
            className="
              mb-6
              flex gap-2
              overflow-x-auto
              scrollbar-none
              pb-1
            "
          >
            {LEVELS.map((level) => {
              const active =
                selectedLevel === level;

              return (
                <button
                  key={level}
                  onClick={() =>
                    setSelectedLevel(level)
                  }
                  className={`
                    min-h-[30px]
                    shrink-0
                    rounded-lg
                    border
                    px-2.5
                    text-[8px]
                    font-medium
                    transition
                    ${
                      active
                        ? `
                          border-red-500/20
                          bg-red-500/[0.08]
                          text-red-300
                        `
                        : `
                          border-white/[0.05]
                          bg-white/[0.015]
                          text-slate-600
                          hover:text-slate-300
                        `
                    }
                  `}
                >
                  {level}
                </button>
              );
            })}
          </div>

          {/* COURSE GRID */}

          <AnimatePresence mode="popLayout">
            {filteredCourses.length > 0 ? (
              <motion.div
                layout
                className="
                  grid
                  grid-cols-1
                  gap-3.5
                  sm:grid-cols-2
                  sm:gap-4
                  xl:grid-cols-3
                "
              >
                {filteredCourses.map(
                  (course, index) => (
                    <CourseCard
                      key={`${course.title}-${index}`}
                      course={course}
                      index={index}
                    />
                  )
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="
                  flex min-h-[300px]
                  flex-col
                  items-center
                  justify-center
                  rounded-2xl
                  border border-dashed
                  border-white/10
                  bg-white/[0.015]
                  px-6
                  text-center
                "
              >
                <div
                  className="
                    mb-3
                    flex h-12 w-12
                    items-center justify-center
                    rounded-2xl
                    bg-white/[0.05]
                    text-xl
                  "
                >
                  🔎
                </div>

                <h3
                  className="
                    text-sm font-bold
                    text-white
                  "
                >
                  No courses found
                </h3>

                <p
                  className="
                    mt-1 max-w-sm
                    text-[11px]
                    leading-5
                    text-slate-500
                  "
                >
                  Try another search term,
                  category, or level.
                </p>

                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedLevel('All Levels');
                  }}
                  className="
                    mt-4
                    rounded-xl
                    bg-red-600
                    px-4 py-2.5
                    text-[10px]
                    font-semibold
                    text-white
                    transition
                    hover:bg-red-500
                  "
                >
                  Clear Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        

{/* =========================================================
            HUAWEI AMBASSADOR & CONNECT FOOTER (Interactive UX)
        ========================================================= */}
        <motion.footer 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative mt-12 border-t border-white/[0.08] bg-gradient-to-b from-[#060b15] via-[#040812] to-[#03060c] px-4 pt-12 pb-6 sm:px-8 overflow-hidden"
        >
          {/* تأثير إضاءة خلفية هادئة */}
          <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-40 w-3/4 max-w-2xl rounded-full bg-red-600/10 blur-3xl" />

          <div className="relative z-10 mx-auto max-w-7xl">
            {/* الشبكة العلوية للفوتر (قسم التعريف والسفيرة + التواصل) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10 items-center">
              
              {/* القسم الأيمن / الأساسي: بطاقة السفيرة والتعريف */}
              <div className="lg:col-span-7 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                <div className="relative h-20 w-20 shrink-0 rounded-2xl border-2 border-red-500/50 overflow-hidden shadow-xl bg-slate-800">
                  <img 
                    src="/ambassador-profile.jpeg" 
                    alt="Walaa Salah - Huawei Student Ambassador" 
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-[#040812] bg-red-500 animate-pulse" />
                </div>

                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 border border-red-500/30 px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-red-300 mb-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping" />
                    Official Huawei Student Ambassador
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-wide">
                    Walaa Salah
                  </h3>
                  
                  <p className="text-xs text-slate-300 font-medium mt-1 max-w-md leading-relaxed">
                    Informatics Engineering Student at University of Technology Bahrain (UTB). Leading the Huawei ICT Academy student hub to empower future tech innovators.
                  </p>
                </div>
              </div>

              {/* القسم الأيسر: أزرار التواصل والسفيرة (LinkedIn + Outlook الرسمي) */}
              <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center gap-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
                  Let's Connect & Collaborate 🤝
                </span>
                
                <div className="flex flex-wrap items-center justify-center lg:justify-end gap-2.5">
                  {/* LinkedIn */}
                  <a 
                    href="https://www.linkedin.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 active:scale-95"
                  >
                    <span>💼</span> LinkedIn
                  </a>

                  {/* University Outlook الرسمي */}
                  <a 
                    href="mailto:bh23500186@UTB.EDU.BH" 
                    className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-[0_4px_15px_rgba(220,38,38,0.2)] transition hover:bg-red-500 active:scale-95"
                  >
                    <span>📬</span> University Outlook
                  </a>
                </div>
              </div>

            </div>

            {/* الخط الفاصل السفلي وحقوق النشر */}
            <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <span className="text-[10px] font-medium text-slate-500">
                &copy; {new Date().getFullYear()} UTB Learning Hub &bull; Huawei ICT Academy Student Portal. All rights reserved.
              </span>

              <div className="flex items-center gap-4">
                <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/20">
                  Ambassador Hub 🚀
                </span>
              </div>
            </div>

          </div>
        </motion.footer>

        {/* =================================================
            FOOTER الأصلي للموقع
        ================================================= */}
        <footer
          className="
            border-t border-white/[0.06]
            bg-[#060b15]
            px-4 py-3
            pb-[max(0.75rem,env(safe-area-inset-bottom))]
            sm:px-6
          "
        >
          <div
            className="
              flex flex-col
              items-center
              justify-between
              gap-1.5
              text-center
              sm:flex-row
              sm:text-left
            "
          >
            <span
              className="
                text-[9px]
                font-medium
                text-slate-600
              "
            >
              Huawei ICT Academy · UTB Student Hub
            </span>

            <a
              href={HUAWEI_PORTAL}
              target="_blank"
              rel="noopener noreferrer"
              className="
                text-[9px]
                text-slate-600
                transition
                hover:text-red-400
              "
            >
              Huawei Learning Portal ↗
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}