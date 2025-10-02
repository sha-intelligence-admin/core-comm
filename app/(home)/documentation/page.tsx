"use client";
import Footer from '@/components/home/Footer';
import Header from '@/components/home/header';
import PageLoader from '@/components/home/PageLoader';
import { usePageLoading } from '@/hooks/usePageLoading';
import { motion } from 'framer-motion';
import { BookOpen, Code, Zap, Shield, ArrowRight, Copy, Check, Menu, X, ArrowUpRight } from 'lucide-react';
import React, { useState } from 'react';

const DocumentationCard = ({ icon: Icon, title, description, link }) => {
    const handleClick = () => {
        const element = document.querySelector(link);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            onClick={handleClick}
            className='bg-gradient-to-br from-aquaGlow/10 via-electricBlue/10 to-neonPurple/10 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group'>
            <div className='flex items-center space-x-4 mb-4'>
                <div className='p-3 bg-gradient-to-br from-electricBlue/30 to-neonPurple/30 rounded-lg'>
                    <Icon className='w-6 h-6 text-white' />
                </div>
                <h3 className='text-xl font-semibold text-white'>{title}</h3>
            </div>
            <p className='text-gray-400 mb-4'>{description}</p>
            <div className='flex items-center text-electricBlue group-hover:text-aquaGlow transition-colors'>
                <span className='text-sm font-medium'>Learn more</span>
                <ArrowUpRight className='w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform' />
            </div>
        </motion.div>
    );
};

const IntegrationCard = ({ item, onClick }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            onClick={() => onClick(item)}
            className='bg-gradient-to-br from-aquaGlow/10 via-electricBlue/10 to-neonPurple/10 p-4 rounded-xl shadow-md flex flex-col justify-between h-full hover:shadow-xl transition-all duration-300 group cursor-pointer'>
            <div className='flex space-x-4 mb-4 items-center'>
                <img src={item.logo} alt={item.title} className='w-12 h-12 object-contain' />
                <h3 className='text-lg font-semibold text-white'>{item.title}</h3>
            </div>
            <p className='text-gray-400 line-clamp-4 mb-4'>{item.Description}</p>
            <div className='w-full flex justify-between items-center mt-4'>
                <button className='w-full flex justify-between items-center text-electricBlue hover:text-aquaGlow transition-colors group-hover:translate-x-1'>
                    <span className='font-medium'>View Documentation</span>
                    <ArrowUpRight className='w-4 h-4' />
                </button>
            </div>
        </motion.div>
    );
};

const CodeBlock = ({ code, language = 'javascript' }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className='relative bg-gray-900 rounded-lg p-4 my-4 overflow-hidden'>
            <div className='flex justify-between items-center mb-2'>
                <span className='text-xs text-gray-400 uppercase'>{language}</span>
                <button
                    onClick={handleCopy}
                    className='flex items-center space-x-2 text-gray-400 hover:text-white transition-colors'>
                    {copied ? (
                        <>
                            <Check className='w-4 h-4' />
                            <span className='text-xs'>Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className='w-4 h-4' />
                            <span className='text-xs'>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <pre className='text-xs sm:text-sm text-gray-300 overflow-x-auto'>
                <code>{code}</code>
            </pre>
        </div>
    );
};

const DocumentationSection = ({ id, title, children }) => {
    return (
        <motion.div
            id={id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className='mb-12 scroll-mt-24'>
            <h2 className='text-3xl font-medium font-montserrat text-white mb-6 bg-gradient-to-r from-electricBlue to-neonPurple bg-clip-text text-transparent'>
                {title}
            </h2>
            {children}
        </motion.div>
    );
};


const DocumentationPage = () => {
    const [activeSection, setActiveSection] = useState('getting-started');
    const [selectedIntegration, setSelectedIntegration] = useState(null);

    const { isLoading } = usePageLoading({
        minLoadingTime: 100,
        additionalDelay: 50
    });

    // Handle URL parameters for deep linking
    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const section = params.get('section');
        const integration = params.get('integration');

        if (section) {
            // Scroll to the specified section
            setTimeout(() => {
                const element = document.getElementById(section);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    setActiveSection(section);
                }
            }, 500);
        }

        if (integration) {
            // Find and open the specified integration
            const integrationData = integrations.find(
                item => item.title.toLowerCase().replace(/\s+/g, '-') === integration.toLowerCase()
            );
            if (integrationData) {
                setTimeout(() => {
                    setSelectedIntegration(integrationData);
                }, 800);
            }
        }
    }, []);

    const quickStartCards = [
        {
            icon: BookOpen,
            title: "Getting Started",
            description: "Learn the basics and set up your first integration in minutes with our step-by-step guide.",
            link: "#getting-started"
        },
        {
            icon: Code,
            title: "API Reference",
            description: "Explore our comprehensive API documentation with detailed endpoints and parameters.",
            link: "#api-reference"
        },
        {
            icon: Zap,
            title: "Integrations",
            description: "Connect with popular platforms and services using our pre-built integrations.",
            link: "#integrations"
        },
        {
            icon: Shield,
            title: "Authentication",
            description: "Secure your integration with OAuth 2.0 and API key authentication methods.",
            link: "#authentication"
        }
    ];

    const integrations = [
        { 
            title: "Salesforce", 
            logo: "/salesforce.png", 
            Description: "Salesforce is a cloud-based software company that provides customer relationship management (CRM) services and a suite of enterprise applications focused on customer service, marketing automation, analytics, and application development.",
            setup: `// Install Salesforce SDK
npm install @yourapp/salesforce-sdk

// Initialize Salesforce connection
import { SalesforceClient } from '@yourapp/salesforce-sdk';

const salesforce = new SalesforceClient({
  clientId: process.env.SALESFORCE_CLIENT_ID,
  clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
  redirectUri: 'https://yourapp.com/callback',
  instanceUrl: 'https://yourinstance.salesforce.com'
});`,
            example: `// Fetch contacts
const contacts = await salesforce.contacts.list({
  limit: 100,
  fields: ['Id', 'Name', 'Email', 'Phone']
});

// Create a new lead
const newLead = await salesforce.leads.create({
  FirstName: 'John',
  LastName: 'Doe',
  Company: 'Acme Corp',
  Email: 'john@acme.com',
  Status: 'Open'
});

// Update an opportunity
await salesforce.opportunities.update('006xx000003DHP0', {
  StageName: 'Closed Won',
  Amount: 50000
});`
        },
        { 
            title: "HubSpot", 
            logo: "/hubspot.png", 
            Description: "HubSpot is a leading inbound marketing, sales, and service software that helps businesses grow by attracting, engaging, and delighting customers.",
            setup: `// Install HubSpot SDK
npm install @yourapp/hubspot-sdk

// Initialize HubSpot connection
import { HubSpotClient } from '@yourapp/hubspot-sdk';

const hubspot = new HubSpotClient({
  apiKey: process.env.HUBSPOT_API_KEY,
  // or use OAuth
  accessToken: process.env.HUBSPOT_ACCESS_TOKEN
});`,
            example: `// Create a contact
const contact = await hubspot.contacts.create({
  properties: {
    email: 'contact@example.com',
    firstname: 'Jane',
    lastname: 'Smith',
    phone: '+1234567890'
  }
});

// Get all deals
const deals = await hubspot.deals.list({
  limit: 50,
  properties: ['dealname', 'amount', 'dealstage']
});

// Send marketing email
await hubspot.marketing.sendEmail({
  emailId: 12345,
  message: {
    to: 'recipient@example.com',
    from: 'sender@yourcompany.com'
  }
});`
        },
        { 
            title: "Zoho", 
            logo: "/zoho.png", 
            Description: "Zoho is a cloud-based software suite that offers a range of applications for businesses, including CRM, project management, and collaboration tools.",
            setup: `// Install Zoho SDK
npm install @yourapp/zoho-sdk

// Initialize Zoho connection
import { ZohoClient } from '@yourapp/zoho-sdk';

const zoho = new ZohoClient({
  clientId: process.env.ZOHO_CLIENT_ID,
  clientSecret: process.env.ZOHO_CLIENT_SECRET,
  refreshToken: process.env.ZOHO_REFRESH_TOKEN,
  region: 'com' // or 'eu', 'in', 'au'
});`,
            example: `// Get CRM records
const accounts = await zoho.crm.accounts.list({
  page: 1,
  perPage: 200
});

// Create a new contact
const newContact = await zoho.crm.contacts.create({
  First_Name: 'Robert',
  Last_Name: 'Brown',
  Email: 'robert@example.com',
  Account_Name: 'Tech Solutions Inc'
});

// Update a deal
await zoho.crm.deals.update('1234567890', {
  Stage: 'Negotiation',
  Amount: 75000
});`
        },
        { 
            title: "Freshdesk", 
            logo: "/freshdesk.png", 
            Description: "Freshdesk is a cloud-based customer support platform that helps businesses manage customer inquiries and support tickets.",
            setup: `// Install Freshdesk SDK
npm install @yourapp/freshdesk-sdk

// Initialize Freshdesk connection
import { FreshdeskClient } from '@yourapp/freshdesk-sdk';

const freshdesk = new FreshdeskClient({
  domain: 'yourcompany.freshdesk.com',
  apiKey: process.env.FRESHDESK_API_KEY
});`,
            example: `// Create a support ticket
const ticket = await freshdesk.tickets.create({
  subject: 'Need help with billing',
  description: 'Customer needs assistance with invoice',
  email: 'customer@example.com',
  priority: 2,
  status: 2,
  tags: ['billing', 'urgent']
});

// Get all tickets
const tickets = await freshdesk.tickets.list({
  filter: 'status:2', // Open tickets
  page: 1
});

// Update ticket status
await freshdesk.tickets.update(ticket.id, {
  status: 4, // Resolved
  priority: 1
});`
        },
        { 
            title: "Zendesk", 
            logo: "/zendesk.png", 
            Description: "Zendesk is a cloud-based customer service platform that provides businesses with tools to manage customer interactions and support tickets.",
            setup: `// Install Zendesk SDK
npm install @yourapp/zendesk-sdk

// Initialize Zendesk connection
import { ZendeskClient } from '@yourapp/zendesk-sdk';

const zendesk = new ZendeskClient({
  subdomain: 'yourcompany',
  email: 'admin@yourcompany.com',
  token: process.env.ZENDESK_API_TOKEN
});`,
            example: `// Create a ticket
const ticket = await zendesk.tickets.create({
  subject: 'Technical Support Request',
  comment: {
    body: 'User experiencing login issues'
  },
  priority: 'high',
  requester: {
    name: 'Customer Name',
    email: 'customer@example.com'
  }
});

// Search tickets
const results = await zendesk.search({
  query: 'type:ticket status:open',
  sort_by: 'created_at',
  sort_order: 'desc'
});

// Add comment to ticket
await zendesk.tickets.addComment(ticket.id, {
  body: 'We are looking into this issue',
  public: true
});`
        },
        { 
            title: "API", 
            logo: "/api.png", 
            Description: "API (Application Programming Interface) is a set of rules and protocols for building and interacting with software applications.",
            setup: `// Install REST API Client
npm install @yourapp/api-client

// Initialize API Client
import { APIClient } from '@yourapp/api-client';

const api = new APIClient({
  baseURL: 'https://api.example.com/v1',
  apiKey: process.env.API_KEY,
  timeout: 10000
});`,
            example: `// Make a GET request
const data = await api.get('/users', {
  params: { page: 1, limit: 50 }
});

// POST request with data
const newUser = await api.post('/users', {
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin'
});

// PUT request to update
await api.put('/users/123', {
  name: 'John Updated',
  status: 'active'
});

// DELETE request
await api.delete('/users/123');`
        },
        { 
            title: "Webflow", 
            logo: "/webflow.png", 
            Description: "Webflow is a web design tool, CMS, and hosting platform in one, allowing users to design, build, and launch responsive websites visually.",
            setup: `// Install Webflow SDK
npm install @yourapp/webflow-sdk

// Initialize Webflow connection
import { WebflowClient } from '@yourapp/webflow-sdk';

const webflow = new WebflowClient({
  token: process.env.WEBFLOW_API_TOKEN,
  siteId: process.env.WEBFLOW_SITE_ID
});`,
            example: `// Get CMS collections
const collections = await webflow.collections.list();

// Create a new CMS item
const blogPost = await webflow.items.create(collectionId, {
  name: 'New Blog Post',
  slug: 'new-blog-post',
  fields: {
    title: 'Introduction to Web Development',
    content: 'Full blog post content here...',
    author: 'Jane Developer',
    'publish-date': '2025-01-15T00:00:00.000Z'
  }
});

// Update CMS item
await webflow.items.update(collectionId, itemId, {
  fields: {
    title: 'Updated Blog Post Title'
  }
});

// Publish site
await webflow.sites.publish(siteId, {
  domains: ['example.com']
});`
        },
        { 
            title: "Asana", 
            logo: "/asana.png", 
            Description: "Asana is a web-based project management tool that helps teams organize, track, and manage their work.",
            setup: `// Install Asana SDK
npm install @yourapp/asana-sdk

// Initialize Asana connection
import { AsanaClient } from '@yourapp/asana-sdk';

const asana = new AsanaClient({
  accessToken: process.env.ASANA_ACCESS_TOKEN
});`,
            example: `// Get projects
const projects = await asana.projects.list({
  workspace: workspaceId,
  archived: false
});

// Create a task
const task = await asana.tasks.create({
  name: 'Complete documentation',
  projects: [projectId],
  assignee: userId,
  due_on: '2025-12-31',
  notes: 'Write comprehensive API docs'
});

// Update task status
await asana.tasks.update(task.gid, {
  completed: true
});

// Add comment to task
await asana.tasks.addComment(task.gid, {
  text: 'Great work on this task!'
});`
        },
    ];

    const installCode = `npm install @yourapp/sdk
# or
yarn add @yourapp/sdk`;

    const quickStartCode = `import { Client } from '@yourapp/sdk';

const client = new Client({
  apiKey: 'your_api_key_here',
  environment: 'production'
});

// Make your first API call
const response = await client.integrations.list();
console.log(response);`;

    const quickStartCodePython = `from yourapp import Client

client = Client(
    api_key='your_api_key_here',
    environment='production'
)

# Make your first API call
response = client.integrations.list()
print(response)`;

    const quickStartCodeTsx = `import { Client } from '@yourapp/sdk';
import { useEffect, useState } from 'react';

export default function IntegrationsList() {
  const [integrations, setIntegrations] = useState([]);
  
  useEffect(() => {
    const client = new Client({
      apiKey: process.env.NEXT_PUBLIC_API_KEY,
      environment: 'production'
    });
    
    client.integrations.list().then(setIntegrations);
  }, []);
  
  return (
    <div>
      {integrations.map(integration => (
        <div key={integration.id}>{integration.name}</div>
      ))}
    </div>
  );
}`;

    const authCode = `const client = new Client({
  apiKey: process.env.API_KEY,
  apiSecret: process.env.API_SECRET
});

// OAuth 2.0 Authentication
const authUrl = client.auth.getAuthorizationUrl({
  redirectUri: 'https://yourapp.com/callback',
  scopes: ['read', 'write']
});`;

    const authCodePython = `import os
from yourapp import Client

client = Client(
    api_key=os.environ.get('API_KEY'),
    api_secret=os.environ.get('API_SECRET')
)

# OAuth 2.0 Authentication
auth_url = client.auth.get_authorization_url(
    redirect_uri='https://yourapp.com/callback',
    scopes=['read', 'write']
)`;

    const webhookCode = `app.post('/webhook', (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const payload = req.body;
  
  // Verify webhook signature
  if (client.webhooks.verify(payload, signature)) {
    // Process the webhook event
    console.log('Event received:', payload.event);
    res.status(200).send('OK');
  } else {
    res.status(401).send('Invalid signature');
  }
});`;

    const webhookCodePython = `from flask import Flask, request

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Webhook-Signature')
    payload = request.json
    
    # Verify webhook signature
    if client.webhooks.verify(payload, signature):
        # Process the webhook event
        print(f'Event received: {payload["event"]}')
        return 'OK', 200
    else:
        return 'Invalid signature', 401`;

    const integrationExampleCode = `// Connect to Salesforce
const salesforce = client.integrations.connect('salesforce', {
  clientId: process.env.SALESFORCE_CLIENT_ID,
  clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
  redirectUri: 'https://yourapp.com/callback'
});

// Sync contacts
const contacts = await salesforce.contacts.list();
console.log(\`Synced \${contacts.length} contacts\`);`;

    const integrationExamplePython = `# Connect to HubSpot
hubspot = client.integrations.connect('hubspot', 
    api_key=os.environ.get('HUBSPOT_API_KEY')
)

# Create a new contact
contact = hubspot.contacts.create({
    'email': 'john@example.com',
    'firstname': 'John',
    'lastname': 'Doe'
})`;

    // Intersection Observer to track active section
    React.useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { threshold: 0.5, rootMargin: '-100px 0px -50% 0px' }
        );

        const sections = document.querySelectorAll('[id]');
        sections.forEach((section) => {
            if (section.id) observer.observe(section);
        });

        return () => observer.disconnect();
    }, []);

    if (isLoading) {
        return <PageLoader />;
    }

    return (
        <div className='bg-deepBlue'>
            <Header />
            {/* Main Content */}
            <div className='flex-1 w-full lg:w-auto overflow-x-hidden'>
                {/* Hero Section */}
                <section className='w-full py-16 flex flex-col justify-center items-center px-4 lg:px-8'>
                    <div className='max-w-4xl w-full text-center'>
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-3xl sm:text-4xl lg:text-5xl font-bold font-montserrat z-10 mb-6 
                                bg-gradient-to-br from-electricBlue to-neonPurple bg-clip-text text-transparent">
                            Documentation
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className='text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto px-4'>
                            Everything you need to integrate, build, and scale with our platform.
                            Get started in minutes with our comprehensive guides and API references.
                        </motion.p>
                    </div>
                </section>

                {/* Quick Start Cards */}
                <section className='w-full py-8 flex flex-col justify-center items-center px-4 lg:px-8'>
                    <div className='max-w-7xl w-full'>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16'>
                            {quickStartCards.map((card, index) => (
                                <DocumentationCard key={index} {...card} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Main Documentation Content */}
                <section className='w-full py-8 flex flex-col justify-center items-center px-4 lg:px-8'>
                    <div className='max-w-7xl w-full'>

                        {/* Getting Started */}
                        <DocumentationSection id="getting-started" title="Getting Started">
                            <div className='bg-gradient-to-br from-aquaGlow/5 via-electricBlue/5 to-neonPurple/5 p-4 sm:p-6 lg:p-8 rounded-xl'>
                                <h3 className='text-lg sm:text-xl font-semibold text-white mb-4'>Installation</h3>
                                <p className='text-sm sm:text-base text-gray-400 mb-4'>
                                    Install our SDK using your preferred package manager:
                                </p>
                                <CodeBlock code={installCode} language="bash" />

                                <h3 className='text-lg sm:text-xl font-semibold text-white mb-4 mt-8'>Quick Start</h3>
                                <p className='text-sm sm:text-base text-gray-400 mb-4'>
                                    Initialize the client and make your first API call:
                                </p>
                                <CodeBlock code={quickStartCode} language="javascript" />
                                <CodeBlock code={quickStartCodePython} language="python" />
                                <CodeBlock code={quickStartCodeTsx} language="tsx" />
                            </div>
                        </DocumentationSection>

                        {/* Authentication */}
                        <DocumentationSection id="authentication" title="Authentication">
                            <div className='bg-gradient-to-br from-aquaGlow/5 via-electricBlue/5 to-neonPurple/5 p-4 sm:p-6 lg:p-8 rounded-xl'>
                                <p className='text-sm sm:text-base text-gray-400 mb-4'>
                                    We support multiple authentication methods to keep your integrations secure:
                                </p>
                                <ul className='list-disc list-inside text-sm sm:text-base text-gray-400 mb-6 space-y-2'>
                                    <li>API Key Authentication</li>
                                    <li>OAuth 2.0 Authorization</li>
                                    <li>JWT Tokens</li>
                                </ul>
                                <CodeBlock code={authCode} language="javascript" />
                                <CodeBlock code={authCodePython} language="python" />
                            </div>
                        </DocumentationSection>

                        {/* Integrations Section */}
                        <DocumentationSection id="integrations" title="Available Integrations">
                            <div className='bg-gradient-to-br from-aquaGlow/5 via-electricBlue/5 to-neonPurple/5 p-4 sm:p-6 lg:p-8 rounded-xl mb-8'>
                                <p className='text-sm sm:text-base text-gray-400 mb-6'>
                                    Connect seamlessly with popular platforms and services. Each integration comes with comprehensive documentation and code examples.
                                </p>
                                
                                <h3 className='text-lg sm:text-xl font-semibold text-white mb-4 mt-6'>Example: Connecting to an Integration</h3>
                                <CodeBlock code={integrationExampleCode} language="javascript" />
                                <CodeBlock code={integrationExamplePython} language="python" />
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
                                {integrations.map((item, index) => (
                                    <IntegrationCard key={index} item={item} onClick={setSelectedIntegration} />
                                ))}
                            </div>

                            {/* Integration Documentation Modal */}
                            {selectedIntegration && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className='fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4'
                                    onClick={() => setSelectedIntegration(null)}>
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.9, opacity: 0 }}
                                        onClick={(e) => e.stopPropagation()}
                                        className='bg-gradient-to-br from-deepBlue via-gray-900 to-deepBlue border border-electricBlue/30 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8'>
                                        <div className='flex justify-between items-start mb-6'>
                                            <div className='flex items-center space-x-4'>
                                                <img src={selectedIntegration.logo} alt={selectedIntegration.title} className='w-16 h-16 object-contain' />
                                                <div>
                                                    <h2 className='text-2xl sm:text-3xl font-bold text-white'>{selectedIntegration.title}</h2>
                                                    <p className='text-gray-400 mt-1'>Integration Documentation</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setSelectedIntegration(null)}
                                                className='text-gray-400 hover:text-white transition-colors p-2'>
                                                <X className='w-6 h-6' />
                                            </button>
                                        </div>

                                        <div className='space-y-6'>
                                            <div>
                                                <h3 className='text-xl font-semibold text-white mb-3'>Overview</h3>
                                                <p className='text-gray-400 text-sm sm:text-base'>{selectedIntegration.Description}</p>
                                            </div>

                                            <div>
                                                <h3 className='text-xl font-semibold text-white mb-3'>Setup & Authentication</h3>
                                                <CodeBlock code={selectedIntegration.setup} language="javascript" />
                                            </div>

                                            <div>
                                                <h3 className='text-xl font-semibold text-white mb-3'>Usage Examples</h3>
                                                <CodeBlock code={selectedIntegration.example} language="javascript" />
                                            </div>

                                            <div className='bg-gradient-to-br from-aquaGlow/10 via-electricBlue/10 to-neonPurple/10 p-4 sm:p-6 rounded-xl'>
                                                <h4 className='text-lg font-semibold text-white mb-2'>Key Features</h4>
                                                <ul className='list-disc list-inside text-gray-400 space-y-2 text-sm sm:text-base'>
                                                    <li>Easy authentication and connection setup</li>
                                                    <li>Comprehensive API coverage with full CRUD operations</li>
                                                    <li>Automatic rate limiting and retry logic</li>
                                                    <li>Built-in error handling and logging</li>
                                                    <li>TypeScript support with full type definitions</li>
                                                    <li>Webhook support for real-time updates</li>
                                                </ul>
                                            </div>

                                            <div className='flex flex-col sm:flex-row gap-4'>
                                                <button className='flex-1 px-6 py-3 bg-gradient-to-r from-electricBlue to-neonPurple rounded-lg text-white font-semibold hover:opacity-90 transition-opacity'>
                                                    View Full Documentation
                                                </button>
                                                <button className='flex-1 px-6 py-3 border border-electricBlue text-electricBlue rounded-lg font-semibold hover:bg-electricBlue/10 transition-colors'>
                                                    API Reference
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </DocumentationSection>

                        {/* API Reference */}
                        <DocumentationSection id="api-reference" title="API Reference">
                            <div className='bg-gradient-to-br from-aquaGlow/5 via-electricBlue/5 to-neonPurple/5 p-4 sm:p-6 lg:p-8 rounded-xl'>
                                <div className='mb-6'>
                                    <h3 className='text-lg sm:text-xl font-semibold text-white mb-2'>Base URL</h3>
                                    <code className='text-sm sm:text-base text-electricBlue break-all'>https://api.yourapp.com/v1</code>
                                </div>

                                <div className='space-y-6'>
                                    <div>
                                        <h4 className='text-base sm:text-lg font-semibold text-white mb-2'>List Integrations</h4>
                                        <div className='flex flex-wrap items-center gap-2 mb-2'>
                                            <span className='px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs sm:text-sm font-mono'>GET</span>
                                            <code className='text-sm sm:text-base text-gray-400 break-all'>/integrations</code>
                                        </div>
                                        <p className='text-xs sm:text-sm text-gray-400'>Retrieve a list of all available integrations.</p>
                                    </div>

                                    <div>
                                        <h4 className='text-base sm:text-lg font-semibold text-white mb-2'>Create Integration</h4>
                                        <div className='flex flex-wrap items-center gap-2 mb-2'>
                                            <span className='px-3 py-1 bg-blue-500/20 text-blue-400 rounded text-xs sm:text-sm font-mono'>POST</span>
                                            <code className='text-sm sm:text-base text-gray-400 break-all'>/integrations</code>
                                        </div>
                                        <p className='text-xs sm:text-sm text-gray-400'>Create a new integration with the specified parameters.</p>
                                    </div>

                                    <div>
                                        <h4 className='text-base sm:text-lg font-semibold text-white mb-2'>Update Integration</h4>
                                        <div className='flex flex-wrap items-center gap-2 mb-2'>
                                            <span className='px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs sm:text-sm font-mono'>PUT</span>
                                            <code className='text-sm sm:text-base text-gray-400 break-all'>/integrations/:id</code>
                                        </div>
                                        <p className='text-xs sm:text-sm text-gray-400'>Update an existing integration by ID.</p>
                                    </div>

                                    <div>
                                        <h4 className='text-base sm:text-lg font-semibold text-white mb-2'>Delete Integration</h4>
                                        <div className='flex flex-wrap items-center gap-2 mb-2'>
                                            <span className='px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs sm:text-sm font-mono'>DELETE</span>
                                            <code className='text-sm sm:text-base text-gray-400 break-all'>/integrations/:id</code>
                                        </div>
                                        <p className='text-xs sm:text-sm text-gray-400'>Remove an integration from your account.</p>
                                    </div>
                                </div>
                            </div>
                        </DocumentationSection>

                        {/* Webhooks */}
                        <DocumentationSection id="webhooks" title="Webhooks">
                            <div className='bg-gradient-to-br from-aquaGlow/5 via-electricBlue/5 to-neonPurple/5 p-4 sm:p-6 lg:p-8 rounded-xl'>
                                <p className='text-sm sm:text-base text-gray-400 mb-4'>
                                    Set up webhooks to receive real-time notifications about events in your integrations:
                                </p>
                                <CodeBlock code={webhookCode} language="javascript" />
                                <CodeBlock code={webhookCodePython} language="python" />
                            </div>
                        </DocumentationSection>

                    </div>
                </section>

                <Footer />
            </div>

        </div>
    );
};

export default DocumentationPage;