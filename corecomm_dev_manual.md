## Advanced Configuration & Optimization

### Performance Tuning

#### 1. **Database Optimization**
```sql
-- Create indexes for better query performance
CREATE INDEX CONCURRENTLY idx_conversations_status ON conversations(status);
CREATE INDEX CONCURRENTLY idx_conversations_started_at ON conversations(started_at);
CREATE INDEX CONCURRENTLY idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX CONCURRENTLY idx_messages_created_at ON messages(created_at);
CREATE INDEX CONCURRENTLY idx_knowledge_base_tenant_id ON knowledge_base(tenant_id);

-- Optimize for vector similarity search
CREATE INDEX CONCURRENTLY idx_knowledge_base_embedding ON knowledge_base 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Set up connection pooling
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
```

#### 2. **Redis Caching Strategy**
```javascript
// Cache frequently accessed data
class CacheManager {
    constructor(redisClient) {
        this.redis = redisClient;
        this.defaultTTL = 3600; // 1 hour
    }
    
    async cacheCustomerInfo(phone, customerData) {
        const key = `customer:${phone}`;
        await this.redis.setex(key, this.defaultTTL, JSON.stringify(customerData));
    }
    
    async getCachedCustomerInfo(phone) {
        const key = `customer:${phone}`;
        const cached = await this.redis.get(key);
        return cached ? JSON.parse(cached) : null;
    }
    
    async cacheKnowledgeResults(query, results) {
        const key = `knowledge:${this.hashQuery(query)}`;
        await this.redis.setex(key, this.defaultTTL, JSON.stringify(results));
    }
    
    hashQuery(query) {
        return require('crypto').createHash('md5').update(query.toLowerCase()).digest('hex');
    }
}
```

#### 3. **AI Model Optimization**
```python
# Implement response streaming for faster perceived performance
async def stream_ai_response(prompt, conversation_context):
    """Stream AI responses for better user experience"""
    
    async for chunk in await openai_client.chat.completions.create(
        model="gpt-4",
        messages=conversation_context,
        stream=True,
        temperature=0.7
    ):
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content

# Implement prompt caching
class PromptCache:
    def __init__(self):
        self.cache = {}
        self.max_size = 1000
    
    def get_cached_response(self, prompt_hash):
        return self.cache.get(prompt_hash)
    
    def cache_response(self, prompt_hash, response):
        if len(self.cache) >= self.max_size:
            # Remove oldest entry
            oldest_key = next(iter(self.cache))
            del self.cache[oldest_key]
        
        self.cache[prompt_hash] = response
```

### Advanced Features Implementation

#### 1. **Multi-Language Support**
```python
# Language detection and translation
from googletrans import Translator
import langdetect

class MultiLanguageHandler:
    def __init__(self):
        self.translator = Translator()
        self.supported_languages = ['en', 'es', 'fr', 'de', 'it', 'pt']
    
    def detect_language(self, text):
        try:
            return langdetect.detect(text)
        except:
            return 'en'  # Default to English
    
    async def translate_to_english(self, text, source_lang):
        if source_lang == 'en':
            return text
        
        try:
            result = self.translator.translate(text, src=source_lang, dest='en')
            return result.text
        except:
            return text  # Return original if translation fails
    
    async def translate_response(self, text, target_lang):
        if target_lang == 'en':
            return text
        
        try:
            result = self.translator.translate(text, src='en', dest=target_lang)
            return result.text
        except:
            return text
```

#### 2. **Sentiment Analysis & Emotion Detection**
```python
# Customer sentiment monitoring
from textblob import TextBlob
import re

class SentimentAnalyzer:
    def __init__(self):
        self.negative_keywords = [
            'angry', 'frustrated', 'upset', 'disappointed', 'terrible',
            'awful', 'horrible', 'worst', 'hate', 'furious'
        ]
        
        self.escalation_triggers = [
            'speak to manager', 'this is ridiculous', 'cancel my account',
            'filing a complaint', 'better business bureau', 'lawsuit'
        ]
    
    def analyze_sentiment(self, text):
        # Use TextBlob for basic sentiment analysis
        blob = TextBlob(text.lower())
        polarity = blob.sentiment.polarity  # -1 to 1
        subjectivity = blob.sentiment.subjectivity  # 0 to 1
        
        # Check for escalation triggers
        escalation_risk = any(trigger in text.lower() for trigger in self.escalation_triggers)
        
        # Check for negative keywords
        negative_count = sum(1 for keyword in self.negative_keywords if keyword in text.lower())
        
        return {
            'polarity': polarity,
            'subjectivity': subjectivity,
            'sentiment': 'positive' if polarity > 0.1 else 'negative' if polarity < -0.1 else 'neutral',
            'escalation_risk': escalation_risk,
            'negative_keywords_count': negative_count,
            'emotional_intensity': 'high' if negative_count > 2 or escalation_risk else 'medium' if negative_count > 0 else 'low'
        }
    
    def should_escalate_based_on_sentiment(self, sentiment_analysis):
        return (
            sentiment_analysis['escalation_risk'] or
            sentiment_analysis['polarity'] < -0.5 or
            sentiment_analysis['negative_keywords_count'] > 2
        )
```

#### 3. **Advanced Analytics & Reporting**
```javascript
// Analytics service for business intelligence
class AnalyticsService {
    constructor(database) {
        this.db = database;
    }
    
    async generateDailyReport(date) {
        const report = {
            date: date,
            metrics: await this.getDailyMetrics(date),
            topIssues: await this.getTopIssues(date),
            customerSatisfaction: await this.getCustomerSatisfaction(date),
            aiPerformance: await this.getAIPerformance(date),
            escalationAnalysis: await this.getEscalationAnalysis(date)
        };
        
        return report;
    }
    
    async getDailyMetrics(date) {
        const result = await this.db.query(`
            SELECT 
                COUNT(*) as total_calls,
                COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_calls,
                COUNT(CASE WHEN escalated_to_human = true THEN 1 END) as escalated_calls,
                AVG(EXTRACT(EPOCH FROM (ended_at - started_at))) as avg_duration,
                AVG(CASE WHEN status = 'resolved' THEN 
                    EXTRACT(EPOCH FROM (ended_at - started_at)) END) as avg_resolution_time
            FROM conversations 
            WHERE DATE(started_at) = $1
        `, [date]);
        
        return result.rows[0];
    }
    
    async getTopIssues(date) {
        // Analyze message content to identify common issues
        const result = await this.db.query(`
            SELECT 
                intent,
                COUNT(*) as frequency,
                AVG(CASE WHEN escalated_to_human THEN 1.0 ELSE 0.0 END) as escalation_rate
            FROM conversations c
            JOIN messages m ON c.id = m.conversation_id
            WHERE DATE(c.started_at) = $1 
            AND m.sender_type = 'user'
            GROUP BY intent
            ORDER BY frequency DESC
            LIMIT 10
        `, [date]);
        
        return result.rows;
    }
    
    async exportAnalytics(startDate, endDate, format = 'json') {
        const data = await this.getAnalyticsData(startDate, endDate);
        
        if (format === 'csv') {
            return this.convertToCSV(data);
        }
        
        return data;
    }
    
    convertToCSV(data) {
        // Convert analytics data to CSV format
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).join(','));
        return [headers, ...rows].join('\n');
    }
}
```

### Security Enhancements

#### 1. **Advanced Authentication & Authorization**
```javascript
// Role-based access control
class RBACMiddleware {
    static roles = {
        ADMIN: ['read', 'write', 'delete', 'manage_users'],
        SUPERVISOR: ['read', 'write', 'view_analytics'],
        AGENT: ['read', 'write_own'],
        VIEWER: ['read']
    };
    
    static requirePermission(permission) {
        return (req, res, next) => {
            const userRole = req.user.role;
            const userPermissions = this.roles[userRole] || [];
            
            if (!userPermissions.includes(permission)) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }
            
            next();
        };
    }
    
    static requireRole(role) {
        return (req, res, next) => {
            if (req.user.role !== role) {
                return res.status(403).json({ error: 'Insufficient role' });
            }
            next();
        };
    }
}

// API rate limiting with Redis
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');

const limiter = rateLimit({
    store: new RedisStore({
        client: redisClient,
        prefix: 'rl:',
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP',
    standardHeaders: true,
    legacyHeaders: false,
});
```

#### 2. **Data Encryption & Privacy**
```javascript
// PII (Personally Identifiable Information) handling
const crypto = require('crypto');

class PIIHandler {
    constructor(encryptionKey) {
        this.algorithm = 'aes-256-gcm';
        this.key = Buffer.from(encryptionKey, 'hex');
    }
    
    encryptPII(text) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipher(this.algorithm, this.key);
        cipher.setAAD(Buffer.from('pii-data'));
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        return {
            encrypted,
            iv: iv.toString('hex'),
            authTag: authTag.toString('hex')
        };
    }
    
    decryptPII(encryptedData) {
        const decipher = crypto.createDecipher(this.algorithm, this.key);
        decipher.setAAD(Buffer.from('pii-data'));
        decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
        
        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    }
    
    // Automatically detect and mask PII in conversation logs
    maskPII(text) {
        // Phone numbers
        text = text.replace(/\b\d{3}-\d{3}-\d{4}\b/g, '***-***-****');
        text = text.replace(/\b\(\d{3}\)\s*\d{3}-\d{4}\b/g, '(***) ***-****');
        
        // Email addresses
        text = text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '***@***.***');
        
        // SSN
        text = text.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '***-**-****');
        
        // Credit card numbers
        text = text.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '****-****-****-****');
        
        return text;
    }
}
```

### Integration Guides

#### 1. **Salesforce CRM Integration**
```python
# Salesforce MCP server implementation
from simple_salesforce import Salesforce
import os

class SalesforceMCPServer:
    def __init__(self):
        self.sf = Salesforce(
            username=os.getenv('SALESFORCE_USERNAME'),
            password=os.getenv('SALESFORCE_PASSWORD'),
            security_token=os.getenv('SALESFORCE_TOKEN'),
            domain='login'  # or 'test' for sandbox
        )
    
    async def get_customer(self, phone_number):
        """Get customer information by phone number"""
        try:
            # Clean phone number format
            cleaned_phone = self.clean_phone_number(phone_number)
            
            # Search for contact by phone
            result = self.sf.query(f"""
                SELECT Id, Name, Email, Phone, Account.Name, Account.Id
                FROM Contact 
                WHERE Phone = '{cleaned_phone}' 
                OR MobilePhone = '{cleaned_phone}'
                LIMIT 1
            """)
            
            if result['records']:
                contact = result['records'][0]
                return {
                    'customer_id': contact['Id'],
                    'name': contact['Name'],
                    'email': contact['Email'],
                    'phone': contact['Phone'],
                    'account_name': contact['Account']['Name'],
                    'account_id': contact['Account']['Id']
                }
            
            return {'error': 'Customer not found'}
            
        except Exception as e:
            return {'error': str(e)}
    
    async def create_case(self, customer_id, subject, description):
        """Create a support case in Salesforce"""
        try:
            case_data = {
                'ContactId': customer_id,
                'Subject': subject,
                'Description': description,
                'Origin': 'Phone',
                'Status': 'New',
                'Priority': 'Medium'
            }
            
            result = self.sf.Case.create(case_data)
            return {
                'case_id': result['id'],
                'case_number': self.get_case_number(result['id']),
                'success': True
            }
            
        except Exception as e:
            return {'error': str(e), 'success': False}
    
    def clean_phone_number(self, phone):
        """Clean and format phone number for Salesforce search"""
        import re
        # Remove all non-digit characters
        digits_only = re.sub(r'\D', '', phone)
        
        # Format as (XXX) XXX-XXXX if US number
        if len(digits_only) == 10:
            return f"({digits_only[:3]}) {digits_only[3:6]}-{digits_only[6:]}"
        elif len(digits_only) == 11 and digits_only[0] == '1':
            return f"({digits_only[1:4]}) {digits_only[4:7]}-{digits_only[7:]}"
        
        return phone  # Return original if can't format
```

#### 2. **Shopify E-commerce Integration**
```python
# Shopify order management integration
import shopify
import os

class ShopifyMCPServer:
    def __init__(self):
        shopify.ShopifyResource.set_site(os.getenv('SHOPIFY_SHOP_URL'))
        shopify.ShopifyResource.set_headers({
            'X-Shopify-Access-Token': os.getenv('SHOPIFY_ACCESS_TOKEN')
        })
    
    async def get_order_status(self, order_id):
        """Get order status and tracking information"""
        try:
            order = shopify.Order.find(order_id)
            
            fulfillments = order.fulfillments
            tracking_info = []
            
            for fulfillment in fulfillments:
                tracking_info.append({
                    'tracking_number': fulfillment.tracking_number,
                    'tracking_url': fulfillment.tracking_url,
                    'carrier': fulfillment.tracking_company,
                    'status': fulfillment.shipment_status
                })
            
            return {
                'order_id': order.id,
                'order_number': order.order_number,
                'status': order.fulfillment_status,
                'financial_status': order.financial_status,
                'total_price': str(order.total_price),
                'currency': order.currency,
                'created_at': str(order.created_at),
                'tracking_info': tracking_info,
                'customer': {
                    'email': order.email,
                    'phone': order.phone
                }
            }
            
        except Exception as e:
            return {'error': str(e)}
    
    async def initiate_return(self, order_id, line_items, reason):
        """Initiate a return for order items"""
        try:
            # Create return in Shopify
            return_data = {
                'return': {
                    'order_id': order_id,
                    'line_items': line_items,
                    'note': f"Return reason: {reason}",
                    'notify_customer': True
                }
            }
            
            # Note: This would use Shopify's Returns API when available
            # For now, create a note on the order
            order = shopify.Order.find(order_id)
            order.note = f"Return requested: {reason}"
            order.save()
            
            return {
                'success': True,
                'return_id': f"RET-{order_id}",
                'message': 'Return request has been created and customer will be contacted'
            }
            
        except Exception as e:
            return {'error': str(e), 'success': False}
```

### Monitoring & Observability

#### 1. **Application Performance Monitoring**
```javascript
// APM integration with custom metrics
const promClient = require('prom-client');

// Custom metrics
const conversationDuration = new promClient.Histogram({
    name: 'conversation_duration_seconds',
    help: 'Duration of customer conversations',
    labelNames: ['outcome', 'intent', 'escalated']
});

const aiConfidence = new promClient.Histogram({
    name: 'ai_confidence_score',
    help: 'AI confidence scores for responses',
    labelNames: ['intent', 'action_type']
});

const escalationRate = new promClient.Counter({
    name: 'escalations_total',
    help: 'Total number of escalations to human agents',
    labelNames: ['reason', 'intent']
});

// Middleware to track metrics
function trackMetrics(req, res, next) {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        
        // Track API response times
        httpRequestDuration
            .labels(req.method, req.route?.path || 'unknown', res.statusCode)
            .observe(duration);
    });
    
    next();
}

// Custom event tracking
class MetricsCollector {
    static trackConversation(conversation) {
        const duration = (conversation.ended_at - conversation.started_at) / 1000;
        const outcome = conversation.escalated_to_human ? 'escalated' : 'resolved';
        
        conversationDuration
            .labels(outcome, conversation.intent || 'unknown', conversation.escalated_to_human)
            .observe(duration);
    }
    
    static trackAIResponse(intent, confidence, actionType = 'none') {
        aiConfidence
            .labels(intent, actionType)
            .observe(confidence);
    }
    
    static trackEscalation(reason, intent) {
        escalationRate
            .labels(reason, intent)
            .inc();
    }
}
```

#### 2. **Health Checks & Circuit Breakers**
```javascript
// Comprehensive health check system
class HealthChecker {
    constructor() {
        this.checks = new Map();
        this.registerDefaultChecks();
    }
    
    registerDefaultChecks() {
        this.checks.set('database', this.checkDatabase);
        this.checks.set('redis', this.checkRedis);
        this.checks.set('ai_engine', this.checkAIEngine);
        this.checks.set('voice_processing', this.checkVoiceProcessing);
        this.checks.set('external_apis', this.checkExternalAPIs);
    }
    
    async runAllChecks() {
        const results = {};
        let overallStatus = 'healthy';
        
        for (const [name, check] of this.checks) {
            try {
                const result = await Promise.race([
                    check(),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Health check timeout')), 5000)
                    )
                ]);
                
                results[name] = { status: 'healthy', ...result };
            } catch (error) {
                results[name] = { status: 'unhealthy', error: error.message };
                overallStatus = 'unhealthy';
            }
        }
        
        return {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            checks: results
        };
    }
    
    async checkDatabase() {
        const result = await pool.query('SELECT NOW()');
        return { 
            response_time: Date.now(),
            connection_count: await this.getDatabaseConnections()
        };
    }
    
    async checkRedis() {
        const start = Date.now();
        await redisClient.ping();
        return { response_time: Date.now() - start };
    }
    
    async checkAIEngine() {
        const response = await fetch('http://ai-engine:8000/health');
        return { 
            status_code: response.status,
            response_time: Date.now()
        };
    }
}

// Circuit breaker pattern for external services
class CircuitBreaker {
    constructor(options = {}) {
        this.failureThreshold = options.failureThreshold || 5;
        this.recoveryTimeout = options.recoveryTimeout || 60000;
        this.monitoringPeriod = options.monitoringPeriod || 10000;
        
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        this.failureCount = 0;
        this.lastFailureTime = null;
        this.successes = 0;
    }
    
    async call(fn) {
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime >= this.recoveryTimeout) {
                this.state = 'HALF_OPEN';
                this.successes = 0;
            } else {
                throw new Error('Circuit breaker is OPEN');
            }
        }
        
        try {
            const result = await fn();
            
            if (this.state === 'HALF_OPEN') {
                this.successes++;
                if (this.successes >= 3) {
                    this.reset();
                }
            } else {
                this.reset();
            }
            
            return result;
        } catch (error) {
            this.recordFailure();
            throw error;
        }
    }
    
    recordFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        
        if (this.failureCount >= this.failureThreshold) {
            this.state = 'OPEN';
        }
    }
    
    reset() {
        this.state = 'CLOSED';
        this.failureCount = 0;
        this.lastFailureTime = null;
        this.successes = 0;
    }
}
```

This completes the comprehensive CoreComm development manual! The guide now includes:

### **🔧 Advanced Technical Features:**
- Performance optimization strategies
- Multi-language support implementation
- Sentiment analysis and emotion detection
- Advanced analytics and reporting systems

### **🛡️ Enhanced Security:**
- Role-based access control (RBAC)
- PII encryption and privacy protection
- Advanced authentication mechanisms
- Data masking and compliance features

### **🔗 Integration Examples:**
- Salesforce CRM integration
- Shopify e-commerce integration
- Generic MCP server implementations

### **📊 Monitoring & Observability:**
- Custom metrics collection
- Health check systems
- Circuit breaker patterns
- APM integration

The manual is now production-ready with enterprise-grade features, security considerations, and real-world integration examples. Your development team can use this as a complete reference to build a robust, scalable AI voice agent platform!  const verifyToken = async (token) => {
    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData.user);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('authToken');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (token, userData) => {
    localStorage.setItem('authToken', token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <LoginPage onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? 
              <Dashboard user={user} onLogout={handleLogout} /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/conversations" 
            element={
              isAuthenticated ? 
              <ConversationMonitor user={user} onLogout={handleLogout} /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/knowledge" 
            element={
              isAuthenticated ? 
              <KnowledgeBase user={user} onLogout={handleLogout} /> : 
              <Navigate to="/login" />
            } 
          />
          <Route 
            path="/settings" 
            element={
              isAuthenticated ? 
              <Settings user={user} onLogout={handleLogout} /> : 
              <Navigate to="/login" />
            } 
          />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
```

**Create `frontend/src/components/Dashboard.js`:**
```javascript
import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Container, Grid, Paper, Box,
  Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton
} from '@mui/material';
import {
  Dashboard as DashboardIcon, Phone, Message, Settings as SettingsIcon,
  MenuBook, Menu as MenuIcon, Logout
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user, onLogout }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stats, setStats] = useState({
    totalCalls: 0,
    activeConversations: 0,
    avgResolutionTime: 0,
    customerSatisfaction: 0
  });
  const [callData, setCallData] = useState([]);
  const navigate = useNavigate();

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time updates
    const interval = setInterval(loadDashboardData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      // Load statistics
      const statsResponse = await fetch('/api/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Load call volume data for chart
      const callDataResponse = await fetch('/api/dashboard/call-volume', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const callVolumeData = await callDataResponse.json();
      setCallData(callVolumeData);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Live Conversations', icon: <Phone />, path: '/conversations' },
    { text: 'Knowledge Base', icon: <MenuBook />, path: '/knowledge' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' }
  ];

  const handleMenuClick = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            CoreComm Dashboard
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            Welcome, {user?.firstName || 'User'}
          </Typography>
          <IconButton color="inherit" onClick={onLogout}>
            <Logout />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Toolbar />
        <Box sx={{ width: 250 }}>
          <List>
            {menuItems.map((item) => (
              <ListItem 
                button 
                key={item.text}
                onClick={() => handleMenuClick(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ mb: 4 }}>
            Dashboard
          </Typography>

          {/* Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {stats.totalCalls}
                </Typography>
                <Typography variant="body2">
                  Total Calls Today
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="secondary">
                  {stats.activeConversations}
                </Typography>
                <Typography variant="body2">
                  Active Conversations
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {stats.avgResolutionTime}s
                </Typography>
                <Typography variant="body2">
                  Avg Resolution Time
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h4" color="warning.main">
                  {stats.customerSatisfaction}%
                </Typography>
                <Typography variant="body2">
                  Customer Satisfaction
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Call Volume Chart */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Call Volume (Last 24 Hours)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={callData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="calls" 
                      stroke="#1976d2" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;
```

**Create `frontend/src/components/ConversationMonitor.js`:**
```javascript
import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, List, ListItem, ListItemText,
  Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, Card, CardContent
} from '@mui/material';
import { Phone, AccessTime, Person } from '@mui/icons-material';
import io from 'socket.io-client';

const ConversationMonitor = ({ user, onLogout }) => {
  const [activeConversations, setActiveConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Load initial data
    loadActiveConversations();

    // Set up WebSocket connection for real-time updates
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // Listen for real-time conversation updates
    newSocket.on('conversation_update', (data) => {
      setActiveConversations(prev => {
        const updated = prev.map(conv => 
          conv.call_sid === data.call_sid ? { ...conv, ...data } : conv
        );
        
        // Add new conversation if it doesn't exist
        if (!updated.find(conv => conv.call_sid === data.call_sid)) {
          updated.push(data);
        }

        return updated;
      });
    });

    newSocket.on('conversation_ended', (data) => {
      setActiveConversations(prev => 
        prev.filter(conv => conv.call_sid !== data.call_sid)
      );
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const loadActiveConversations = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/conversations/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setActiveConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const handleTakeOver = async (callSid) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`/api/conversations/${callSid}/takeover`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // In a real implementation, this would open the agent interface
      alert('Taking over conversation...');
    } catch (error) {
      console.error('Error taking over conversation:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'escalated': return 'warning';
      case 'waiting': return 'info';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Live Conversations
      </Typography>

      {activeConversations.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            No active conversations
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {activeConversations.map((conversation) => (
            <Grid item xs={12} md={6} lg={4} key={conversation.call_sid}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">
                      {conversation.customer_phone}
                    </Typography>
                    <Chip 
                      label={conversation.status} 
                      color={getStatusColor(conversation.status)}
                      size="small"
                    />
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTime sx={{ mr: 1, fontSize: 'small' }} />
                    <Typography variant="body2">
                      Duration: {Math.floor((Date.now() - new Date(conversation.started_at)) / 1000 / 60)} min
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Person sx={{ mr: 1, fontSize: 'small' }} />
                    <Typography variant="body2">
                      Intent: {conversation.last_intent || 'Unknown'}
                    </Typography>
                  </Box>

                  <Typography variant="body2" sx={{ mb: 2 }}>
                    Last message: "{conversation.last_message?.substring(0, 50)}..."
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      size="small" 
                      onClick={() => setSelectedConversation(conversation)}
                    >
                      View Details
                    </Button>
                    {conversation.status === 'escalated' && (
                      <Button 
                        size="small" 
                        variant="contained"
                        onClick={() => handleTakeOver(conversation.call_sid)}
                      >
                        Take Over
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Conversation Detail Dialog */}
      <Dialog 
        open={!!selectedConversation} 
        onClose={() => setSelectedConversation(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Conversation Details - {selectedConversation?.customer_phone}
        </DialogTitle>
        <DialogContent>
          {selectedConversation && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Message History
              </Typography>
              <List>
                {selectedConversation.messages?.map((message, index) => (
                  <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2">
                        {message.sender_type === 'user' ? 'Customer' : 'AI Assistant'}
                      </Typography>
                      <Typography variant="caption">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Box>
                    <Typography variant="body2">
                      {message.content}
                    </Typography>
                    {message.confidence && (
                      <Typography variant="caption" color="textSecondary">
                        Confidence: {(message.confidence * 100).toFixed(1)}%
                      </Typography>
                    )}
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedConversation(null)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ConversationMonitor;
```

### Step 2: Backend API Endpoints for Dashboard

**Create `backend/routes/dashboard.js`:**
```javascript
const express = require('express');
const { Pool } = require('pg');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// Get dashboard statistics
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        
        // Get total calls today
        const totalCallsResult = await pool.query(`
            SELECT COUNT(*) as total_calls 
            FROM conversations 
            WHERE DATE(started_at) = $1
        `, [today]);
        
        // Get active conversations
        const activeConversationsResult = await pool.query(`
            SELECT COUNT(*) as active_conversations 
            FROM conversations 
            WHERE status = 'active'
        `);
        
        // Get average resolution time (in seconds)
        const avgResolutionResult = await pool.query(`
            SELECT AVG(EXTRACT(EPOCH FROM (ended_at - started_at))) as avg_resolution
            FROM conversations 
            WHERE ended_at IS NOT NULL 
            AND DATE(started_at) = $1
        `, [today]);
        
        // Calculate customer satisfaction (placeholder - you'd implement actual feedback collection)
        const customerSatisfaction = 85; // This would come from actual feedback data
        
        res.json({
            totalCalls: parseInt(totalCallsResult.rows[0].total_calls) || 0,
            activeConversations: parseInt(activeConversationsResult.rows[0].active_conversations) || 0,
            avgResolutionTime: Math.round(avgResolutionResult.rows[0].avg_resolution) || 0,
            customerSatisfaction: customerSatisfaction
        });
        
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get call volume data for charts
router.get('/call-volume', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                EXTRACT(HOUR FROM started_at) as hour,
                COUNT(*) as calls
            FROM conversations 
            WHERE started_at >= NOW() - INTERVAL '24 hours'
            GROUP BY EXTRACT(HOUR FROM started_at)
            ORDER BY hour
        `);
        
        // Fill in missing hours with 0 calls
        const callData = [];
        for (let hour = 0; hour < 24; hour++) {
            const existingData = result.rows.find(row => parseInt(row.hour) === hour);
            callData.push({
                hour: hour,
                calls: existingData ? parseInt(existingData.calls) : 0
            });
        }
        
        res.json(callData);
        
    } catch (error) {
        console.error('Error getting call volume data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
```

**Create `backend/routes/conversations.js`:**
```javascript
const express = require('express');
const { Pool } = require('pg');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// Get active conversations
router.get('/active', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                c.*,
                (
                    SELECT content 
                    FROM messages m 
                    WHERE m.conversation_id = c.id 
                    ORDER BY m.created_at DESC 
                    LIMIT 1
                ) as last_message,
                (
                    SELECT sender_type 
                    FROM messages m 
                    WHERE m.conversation_id = c.id 
                    ORDER BY m.created_at DESC 
                    LIMIT 1
                ) as last_sender
            FROM conversations c
            WHERE c.status IN ('active', 'escalated')
            ORDER BY c.started_at DESC
        `);
        
        // Get message history for each conversation
        const conversations = [];
        for (const conv of result.rows) {
            const messagesResult = await pool.query(`
                SELECT * FROM messages 
                WHERE conversation_id = $1 
                ORDER BY created_at ASC
            `, [conv.id]);
            
            conversations.push({
                ...conv,
                messages: messagesResult.rows
            });
        }
        
        res.json(conversations);
        
    } catch (error) {
        console.error('Error getting active conversations:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Take over a conversation (transfer to human agent)
router.post('/:callSid/takeover', authenticateToken, async (req, res) => {
    try {
        const { callSid } = req.params;
        const agentId = req.user.id;
        
        // Update conversation status
        await pool.query(`
            UPDATE conversations 
            SET 
                status = 'human_agent',
                escalated_to_human = true,
                updated_at = CURRENT_TIMESTAMP
            WHERE session_id = $1
        `, [callSid]);
        
        // Log the takeover action
        await pool.query(`
            INSERT INTO actions (conversation_id, action_type, action_data, success)
            SELECT id, 'agent_takeover', $2, true
            FROM conversations 
            WHERE session_id = $1
        `, [callSid, JSON.stringify({ agent_id: agentId, timestamp: new Date() })]);
        
        // In a real implementation, you would also:
        // 1. Notify the voice processing system to transfer the call
        // 2. Set up the agent's interface with conversation context
        
        res.json({ message: 'Conversation taken over successfully' });
        
    } catch (error) {
        console.error('Error taking over conversation:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get conversation history
router.get('/:id/history', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        const conversationResult = await pool.query(`
            SELECT * FROM conversations WHERE id = $1
        `, [id]);
        
        if (conversationResult.rows.length === 0) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        
        const messagesResult = await pool.query(`
            SELECT * FROM messages 
            WHERE conversation_id = $1 
            ORDER BY created_at ASC
        `, [id]);
        
        const actionsResult = await pool.query(`
            SELECT * FROM actions 
            WHERE conversation_id = $1 
            ORDER BY created_at ASC
        `, [id]);
        
        res.json({
            conversation: conversationResult.rows[0],
            messages: messagesResult.rows,
            actions: actionsResult.rows
        });
        
    } catch (error) {
        console.error('Error getting conversation history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
```

**Update `backend/server.js` to include new routes:**
```javascript
// Add these after your existing routes
const dashboardRoutes = require('./routes/dashboard');
const conversationRoutes = require('./routes/conversations');

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/conversations', conversationRoutes);
```

  # AI Engine
  ai-engine:
    build:
      context: ./ai-engine
      dockerfile: Dockerfile
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    ports:
      - "8000:8000"
    volumes:
      - ai_data:/app/chroma_db
    networks:
      - corecomm-network

  # Voice Processing
  voice-processing:
    build:
      context: ./voice-processing
      dockerfile: Dockerfile
    environment:
      - TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID}
      - TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN}
      - DEEPGRAM_API_KEY=${DEEPGRAM_API_KEY}
      - ELEVENLABS_API_KEY=${ELEVENLABS_API_KEY}
    ports:
      - "3001:3001"
    depends_on:
      - backend
      - ai-engine
    networks:
      - corecomm-network

  # Frontend (served by nginx)
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - corecomm-network

volumes:
  postgres_data:
  ai_data:

networks:
  corecomm-network:
    driver: bridge
```

**Create `ai-engine/Dockerfile`:**
```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
USER app

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Create `frontend/Dockerfile`:**
```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build files
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Step 2: AWS Deployment Configuration

**Create `infrastructure/terraform/main.tf`:**
```hcl
# AWS Provider
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "corecomm"
}

# VPC Configuration
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "${var.project_name}-vpc"
    Environment = var.environment
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

# Public Subnet (DMZ)
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-subnet"
    Type = "Public"
  }
}

# Private Subnet (Application)
resource "aws_subnet" "private_app" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "${var.aws_region}a"

  tags = {
    Name = "${var.project_name}-private-app-subnet"
    Type = "Private"
  }
}

# Private Subnet (Data)
resource "aws_subnet" "private_data" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "${var.aws_region}a"

  tags = {
    Name = "${var.project_name}-private-data-subnet"
    Type = "Private"
  }
}

# Route Table for Public Subnet
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# NAT Gateway for Private Subnets
resource "aws_eip" "nat" {
  domain = "vpc"
  tags = {
    Name = "${var.project_name}-nat-eip"
  }
}

resource "aws_nat_gateway" "main" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public.id

  tags = {
    Name = "${var.project_name}-nat-gateway"
  }

  depends_on = [aws_internet_gateway.main]
}

# Route Table for Private Subnets
resource "aws_route_table" "private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main.id
  }

  tags = {
    Name = "${var.project_name}-private-rt"
  }
}

resource "aws_route_table_association" "private_app" {
  subnet_id      = aws_subnet.private_app.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_data" {
  subnet_id      = aws_subnet.private_data.id
  route_table_id = aws_route_table.private.id
}

# Security Groups
resource "aws_security_group" "alb" {
  name_prefix = "${var.project_name}-alb-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-alb-sg"
  }
}

resource "aws_security_group" "app" {
  name_prefix = "${var.project_name}-app-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    from_port       = 8000
    to_port         = 8000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-app-sg"
  }
}

# RDS Database
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = [aws_subnet.private_data.id, aws_subnet.private_app.id]

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}

resource "aws_security_group" "rds" {
  name_prefix = "${var.project_name}-rds-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  tags = {
    Name = "${var.project_name}-rds-sg"
  }
}

resource "aws_db_instance" "main" {
  identifier = "${var.project_name}-db"

  engine         = "postgres"
  engine_version = "15.3"
  instance_class = "db.t3.micro"

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp2"
  storage_encrypted     = true

  db_name  = "corecomm"
  username = "corecomm_user"
  password = random_password.db_password.result

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = true

  tags = {
    Name = "${var.project_name}-database"
  }
}

resource "random_password" "db_password" {
  length  = 16
  special = true
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = var.project_name

  tags = {
    Name = "${var.project_name}-cluster"
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = [aws_subnet.public.id]

  enable_deletion_protection = false

  tags = {
    Name = "${var.project_name}-alb"
  }
}

# Outputs
output "vpc_id" {
  value = aws_vpc.main.id
}

output "database_endpoint" {
  value = aws_db_instance.main.endpoint
}

output "load_balancer_dns" {
  value = aws_lb.main.dns_name
}
```

### Step 3: Deployment Scripts

**Create `scripts/deploy.sh`:**
```bash
#!/bin/bash

set -e

echo "🚀 Starting CoreComm Deployment..."

# Configuration
ENVIRONMENT=${1:-production}
AWS_REGION=${AWS_REGION:-us-east-1}
PROJECT_NAME="corecomm"

echo "Environment: $ENVIRONMENT"
echo "AWS Region: $AWS_REGION"

# Step 1: Build Docker images
echo "📦 Building Docker images..."
docker-compose build

# Step 2: Push images to ECR
echo "🏗️ Pushing images to ECR..."

# Get AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Create ECR repositories if they don't exist
for service in backend ai-engine voice-processing frontend; do
    aws ecr describe-repositories --repository-names "${PROJECT_NAME}-${service}" --region $AWS_REGION 2>/dev/null || \
    aws ecr create-repository --repository-name "${PROJECT_NAME}-${service}" --region $AWS_REGION
done

# Tag and push images
docker tag ${PROJECT_NAME}_backend:latest $ECR_REGISTRY/${PROJECT_NAME}-backend:latest
docker tag ${PROJECT_NAME}_ai-engine:latest $ECR_REGISTRY/${PROJECT_NAME}-ai-engine:latest
docker tag ${PROJECT_NAME}_voice-processing:latest $ECR_REGISTRY/${PROJECT_NAME}-voice-processing:latest
docker tag ${PROJECT_NAME}_frontend:latest $ECR_REGISTRY/${PROJECT_NAME}-frontend:latest

docker push $ECR_REGISTRY/${PROJECT_NAME}-backend:latest
docker push $ECR_REGISTRY/${PROJECT_NAME}-ai-engine:latest
docker push $ECR_REGISTRY/${PROJECT_NAME}-voice-processing:latest
docker push $ECR_REGISTRY/${PROJECT_NAME}-frontend:latest

# Step 3: Deploy infrastructure with Terraform
echo "🏗️ Deploying infrastructure..."
cd infrastructure/terraform

terraform init
terraform plan -var="environment=$ENVIRONMENT"
terraform apply -var="environment=$ENVIRONMENT" -auto-approve

# Get outputs
VPC_ID=$(terraform output -raw vpc_id)
DB_ENDPOINT=$(terraform output -raw database_endpoint)
LB_DNS=$(terraform output -raw load_balancer_dns)

cd ../..

# Step 4: Deploy ECS services
echo "🚀 Deploying ECS services..."

# Create ECS task definitions and services
aws ecs register-task-definition \
    --family "${PROJECT_NAME}-backend" \
    --network-mode awsvpc \
    --requires-compatibilities FARGATE \
    --cpu 256 \
    --memory 512 \
    --execution-role-arn "arn:aws:iam::${ACCOUNT_ID}:role/ecsTaskExecutionRole" \
    --container-definitions file://infrastructure/ecs/backend-task-definition.json

# Similar commands for other services...

echo "✅ Deployment completed successfully!"
echo "🌐 Application URL: http://$LB_DNS"
echo "📊 Database Endpoint: $DB_ENDPOINT"
echo "🔧 VPC ID: $VPC_ID"
```

**Create `scripts/setup-development.sh`:**
```bash
#!/bin/bash

echo "🔧 Setting up CoreComm Development Environment..."

# Check prerequisites
echo "Checking prerequisites..."

command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 is required but not installed."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed."; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "❌ PostgreSQL client is required but not installed."; exit 1; }

echo "✅ All prerequisites found"

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your API keys and configuration"
fi

# Install dependencies
echo "📦 Installing dependencies..."

# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..

# Voice Processing
cd voice-processing && npm install && cd ..

# AI Engine
cd ai-engine
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Start development services
echo "🚀 Starting development services..."

# Start database and Redis
docker-compose up -d postgres redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Set up database
cd backend
node database/setup.js
cd ..

# Set up sample knowledge base
cd ai-engine
source venv/bin/activate
python -c "
from knowledge_base import setup_sample_knowledge_base
kb = setup_sample_knowledge_base()
print('✅ Sample knowledge base created')
"
cd ..

echo "✅ Development environment setup complete!"
echo ""
echo "🚀 To start the development servers:"
echo "   Backend:          cd backend && npm run dev"
echo "   AI Engine:        cd ai-engine && source venv/bin/activate && python main.py"
echo "   Voice Processing: cd voice-processing && npm run dev"
echo "   Frontend:         cd frontend && npm start"
echo ""
echo "📚 Documentation: http://localhost:3000/docs"
echo "🎛️  Dashboard:     http://localhost:3000"
```

---

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. **Voice Processing Issues**

**Problem**: Audio quality is poor or choppy
```bash
# Solution: Check audio format conversion
# Ensure proper mu-law to linear conversion
# Verify Twilio webhook configuration
curl -X POST http://localhost:3001/voice-webhook \
  -d "From=+1234567890&CallSid=test123"
```

**Problem**: Speech-to-text accuracy is low
```bash
# Solution: Improve audio preprocessing
# - Enable noise reduction
# - Adjust confidence thresholds
# - Use multiple STT providers for comparison
```

#### 2. **AI Engine Issues**

**Problem**: AI responses are irrelevant or incorrect
```python
# Solution: Improve knowledge base and prompts
# Check knowledge base search results
from ai_engine.knowledge_base import KnowledgeBase
kb = KnowledgeBase()
results = kb.search("customer query here")
print(f"Found {len(results)} relevant documents")
```

**Problem**: High response latency
```python
# Solution: Optimize model calls and caching
# - Use streaming responses
# - Implement response caching
# - Optimize embedding models
```

#### 3. **Database Issues**

**Problem**: Connection errors
```bash
# Check database status
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
psql -h localhost -U corecomm_user -d corecomm -c "SELECT NOW();"
```

#### 4. **MCP Integration Issues**

**Problem**: External system timeouts
```python
# Solution: Implement proper retry logic and circuit breakers
# Check MCP server connectivity
import asyncio
from mcp_integration.mcp_client import MCPClient

async def test_mcp():
    config = load_mcp_config()
    async with MCPClient(config) as client:
        result = await client.call_tool('crm', 'health_check', {})
        print(result)

asyncio.run(test_mcp())
```

#### 5. **Performance Issues**

**Monitoring Commands:**
```bash
# Check system resources
docker stats

# Monitor application logs
docker-compose logs -f backend ai-engine voice-processing

# Check database performance
psql -c "SELECT * FROM pg_stat_activity;"
```

### Debugging Tools

#### 1. **Voice Flow Debugging**
```javascript
// Add to voice-processing for detailed logging
console.log('Audio received:', {
    callSid: callSid,
    audioSize: audioBuffer.length,
    timestamp: new Date().toISOString()
});
```

#### 2. **AI Decision Logging**
```python
# Add to conversation orchestrator
logger.info(f"Intent analysis: {intent_analysis}")
logger.info(f"Knowledge search results: {len(knowledge_results)}")
logger.info(f"Actions executed: {executed_actions}")
```

#### 3. **Database Query Optimization**
```sql
-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE tablename = 'conversations';
```

### Production Monitoring

#### 1. **Health Check Endpoints**
```javascript
// Backend health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.APP_VERSION,
        uptime: process.uptime()
    });
});
```

#### 2. **Metrics Collection**
```javascript
// Add to express app for metrics
const prometheus = require('prom-client');

const httpRequestDuration = new prometheus.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code']
});

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        httpRequestDuration
            .labels(req.method, req.route?.path || req.path, res.statusCode)
            .observe(duration);
    });
    next();
});
```

### Security Checklist

#### Before Going Live:
- [ ] All API keys stored in secure environment variables
- [ ] Database connections use SSL/TLS
- [ ] JWT tokens have appropriate expiration times
- [ ] Input validation on all endpoints
- [ ] Rate limiting implemented
- [ ] CORS configured properly
- [ ] Error messages don't leak sensitive information
- [ ] Logging excludes sensitive data
- [ ] Regular security updates scheduled

---

## Final Steps

### 1. **Production Readiness Checklist**
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Documentation updated
- [ ] Monitoring and alerting configured
- [ ] Backup and disaster recovery tested
- [ ] Team training completed

### 2. **Launch Preparation**
```bash
# Final deployment script
./scripts/deploy.sh production

# Verify all services
./scripts/health-check.sh

# Monitor initial traffic
./scripts/monitor-launch.sh
```

### 3. **Post-Launch Monitoring**
- Monitor call volume and success rates
- Track AI accuracy and escalation rates
- Watch for performance bottlenecks
- Collect user feedback
- Plan iterative improvements

## Conclusion

This manual provides a comprehensive guide to building the CoreComm AI Voice Agent Platform. The system is designed to be scalable, secure, and maintainable, with proper separation of concerns and modern development practices.

Remember to:
- Start with the development environment setup
- Follow the phases in order
- Test thoroughly at each step
- Monitor and optimize continuously
- Keep security as a top priority

Good luck with your CoreComm development! 🚀        {
            "content": "To track your order, you can use the tracking number provided in your shipping confirmation email on our website's tracking page or call customer service.",
            "metadata": {"category": "order_tracking", "title": "How to Track Orders"}
        },
        {
            "content": "We accept all major credit cards, PayPal, and Apple Pay. Payment is processed securely through our encrypted payment system.",
            "metadata": {"category": "payment", "title": "Payment Methods"}
        },
        {
            "content": "If you're experiencing technical issues with our website or app, try clearing your browser cache, updating your app, or using a different browser. For persistent issues, contact technical support.",
            "metadata": {"category": "technical_support", "title": "Common Technical Issues"}
        }
    ]
    
    # Add sample documents
    for i, doc in enumerate(sample_docs):
        kb.add_document(
            content=doc["content"],
            metadata=doc["metadata"],
            doc_id=f"sample_{i+1}"
        )
    
    return kb

if __name__ == "__main__":
    # Test the knowledge base
    kb = setup_sample_knowledge_base()
    
    # Test search
    results = kb.search("How do I return a product?")
    print("Search results:")
    for result in results:
        print(f"- {result['metadata']['title']}: {result['content'][:100]}...")
```

### Step 3: Integrate Knowledge Base with Conversation Orchestrator

**Update `ai-engine/conversation_orchestrator.py`:**
```python
# Add this import at the top
from knowledge_base import KnowledgeBase

# Update the ConversationOrchestrator class constructor:
class ConversationOrchestrator:
    def __init__(self, config: Dict):
        # ... existing initialization code ...
        
        # Initialize knowledge base
        self.knowledge_base = KnowledgeBase(config.get('kb_path', './chroma_db'))
        
        # ... rest of existing code ...

    # Add this new method:
    async def search_knowledge(self, query: str, conversation: Dict) -> List[Dict]:
        """Search the knowledge base for relevant information"""
        try:
            # Search for relevant documents
            results = self.knowledge_base.search(query, limit=3, min_similarity=0.6)
            
            # Log what we found
            logger.info(f"Knowledge search for '{query}' returned {len(results)} results")
            
            return results
            
        except Exception as e:
            logger.error(f"Error searching knowledge base: {str(e)}")
            return []

    # Update the generate_response method to include knowledge retrieval:
    async def generate_response(self, intent_analysis: Dict, conversation: Dict) -> Dict:
        """Generate an appropriate response based on the customer's intent"""
        
        intent = intent_analysis.get('intent', 'OTHER')
        entities = intent_analysis.get('entities', {})
        required_actions = intent_analysis.get('required_actions', [])
        
        # Get the latest customer message
        latest_message = conversation['messages'][-1]['content'] if conversation['messages'] else ""
        
        # Search knowledge base if needed
        knowledge_results = []
        if 'search_knowledge' in required_actions or intent in ['INQUIRY', 'TECHNICAL_SUPPORT']:
            knowledge_results = await self.search_knowledge(latest_message, conversation)
        
        # Build conversation history for context
        messages = [{"role": "system", "content": self.system_prompt}]
        
        # Add knowledge base results as context if found
        if knowledge_results:
            knowledge_context = "Relevant company information:\n"
            for result in knowledge_results:
                knowledge_context += f"- {result['metadata']['title']}: {result['content']}\n"
            
            messages.append({
                "role": "system", 
                "content": f"Use this information to help answer the customer's question:\n{knowledge_context}"
            })
        
        # Add recent conversation history
        for msg in conversation['messages'][-10:]:
            messages.append({
                "role": msg['role'],
                "content": msg['content']
            })
        
        # Add intent analysis as context
        context_message = f"""
Intent Analysis:
- Intent: {intent}
- Entities: {entities}
- Required Actions: {required_actions}
- Urgency: {intent_analysis.get('urgency', 'medium')}
- Knowledge Base Results: {len(knowledge_results)} relevant documents found

Please respond appropriately to the customer's request. If you found relevant information
in the knowledge base, use it to provide an accurate answer. Always be helpful and cite
sources when providing specific company information.
Keep responses conversational and under 50 words when possible.
"""
        
        messages.append({"role": "system", "content": context_message})
        
        try:
            # Generate response using the AI model
            if self.default_model.startswith('gpt'):
                response = await self.openai_client.chat.completions.acreate(
                    model=self.default_model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=200
                )
                response_text = response.choices[0].message.content
            else:
                # Use Anthropic Claude
                message_text = "\n".join([msg["content"] for msg in messages if msg["role"] == "user"])
                response = await self.anthropic_client.messages.create(
                    model="claude-3-sonnet-20240229",
                    max_tokens=200,
                    messages=[{"role": "user", "content": message_text}]
                )
                response_text = response.content[0].text
            
            # Track which knowledge was used
            executed_actions = []
            if knowledge_results:
                executed_actions.append({
                    'type': 'knowledge_search',
                    'query': latest_message,
                    'results_count': len(knowledge_results),
                    'sources': [r['metadata']['title'] for r in knowledge_results]
                })
            
            return {
                'text': response_text.strip(),
                'intent': intent,
                'actions': executed_actions,
                'escalate': False,
                'knowledge_used': len(knowledge_results) > 0
            }
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            conversation['escalation_count'] += 1
            return {
                'text': "I'm sorry, I'm having trouble with that request. Let me try to help you in a different way, or I can connect you with a human agent.",
                'escalate': True
            }
```

---

## Phase 5: MCP Integration

### Step 1: MCP Client Framework

**Create `mcp-integration/mcp_client.py`:**
```python
import asyncio
import json
import logging
import aiohttp
from typing import Dict, List, Any, Optional
from datetime import datetime
import hashlib

logger = logging.getLogger(__name__)

class MCPClient:
    """
    Model Context Protocol (MCP) Client
    This handles secure communication with external systems like CRM, order management, etc.
    """
    
    def __init__(self, config: Dict):
        self.servers = config.get('servers', {})
        self.timeout = config.get('timeout', 30)
        self.max_retries = config.get('max_retries', 3)
        self.session = None
        
        # Audit logging
        self.audit_log = []
        
    async def __aenter__(self):
        """Async context manager entry"""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=self.timeout)
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        if self.session:
            await self.session.close()
    
    async def call_tool(self, server_name: str, tool_name: str, parameters: Dict) -> Dict:
        """
        Call a tool on an MCP server
        
        Args:
            server_name: Name of the MCP server (e.g., 'crm', 'orders')
            tool_name: Name of the tool to call (e.g., 'get_customer', 'check_order')
            parameters: Parameters to pass to the tool
            
        Returns:
            Tool execution result
        """
        if server_name not in self.servers:
            raise ValueError(f"Unknown MCP server: {server_name}")
        
        server_config = self.servers[server_name]
        
        # Create request payload
        request_id = self.generate_request_id()
        payload = {
            "jsonrpc": "2.0",
            "id": request_id,
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": parameters
            }
        }
        
        # Log the request for audit
        audit_entry = {
            'timestamp': datetime.now().isoformat(),
            'request_id': request_id,
            'server': server_name,
            'tool': tool_name,
            'parameters': self.sanitize_for_audit(parameters),
            'status': 'initiated'
        }
        self.audit_log.append(audit_entry)
        
        try:
            # Make the request with retries
            result = await self.make_request_with_retry(server_config, payload)
            
            # Update audit log
            audit_entry['status'] = 'success'
            audit_entry['response_size'] = len(json.dumps(result))
            
            logger.info(f"MCP call successful: {server_name}.{tool_name}")
            return result
            
        except Exception as e:
            # Update audit log
            audit_entry['status'] = 'error'
            audit_entry['error'] = str(e)
            
            logger.error(f"MCP call failed: {server_name}.{tool_name} - {str(e)}")
            raise
    
    async def make_request_with_retry(self, server_config: Dict, payload: Dict) -> Dict:
        """Make HTTP request with retry logic"""
        
        url = server_config['url']
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f"Bearer {server_config.get('api_key', '')}",
            'User-Agent': 'CoreComm-MCP-Client/1.0'
        }
        
        last_exception = None
        
        for attempt in range(self.max_retries):
            try:
                async with self.session.post(url, json=payload, headers=headers) as response:
                    if response.status == 200:
                        result = await response.json()
                        
                        # Check for JSON-RPC error
                        if 'error' in result:
                            raise MCPError(result['error']['code'], result['error']['message'])
                        
                        return result.get('result', {})
                    
                    elif response.status == 429:  # Rate limited
                        wait_time = 2 ** attempt  # Exponential backoff
                        logger.warning(f"Rate limited, waiting {wait_time}s before retry {attempt + 1}")
                        await asyncio.sleep(wait_time)
                        continue
                    
                    else:
                        error_text = await response.text()
                        raise MCPError(response.status, f"HTTP {response.status}: {error_text}")
            
            except asyncio.TimeoutError as e:
                last_exception = e
                if attempt < self.max_retries - 1:
                    logger.warning(f"Request timeout, retrying... (attempt {attempt + 1})")
                    await asyncio.sleep(1)
                continue
            
            except aiohttp.ClientError as e:
                last_exception = e
                if attempt < self.max_retries - 1:
                    logger.warning(f"Request error, retrying... (attempt {attempt + 1})")
                    await asyncio.sleep(1)
                continue
        
        # All retries exhausted
        raise last_exception or Exception("All retry attempts failed")
    
    def generate_request_id(self) -> str:
        """Generate unique request ID"""
        timestamp = datetime.now().isoformat()
        return hashlib.md5(timestamp.encode()).hexdigest()[:16]
    
    def sanitize_for_audit(self, data: Any) -> Any:
        """Remove sensitive information from audit logs"""
        if isinstance(data, dict):
            sanitized = {}
            for key, value in data.items():
                if key.lower() in ['password', 'token', 'secret', 'key', 'ssn', 'credit_card']:
                    sanitized[key] = '[REDACTED]'
                elif isinstance(value, (dict, list)):
                    sanitized[key] = self.sanitize_for_audit(value)
                else:
                    sanitized[key] = value
            return sanitized
        elif isinstance(data, list):
            return [self.sanitize_for_audit(item) for item in data]
        else:
            return data
    
    def get_audit_log(self) -> List[Dict]:
        """Get audit log for compliance"""
        return self.audit_log.copy()

class MCPError(Exception):
    """Custom exception for MCP errors"""
    def __init__(self, code: int, message: str):
        self.code = code
        self.message = message
        super().__init__(f"MCP Error {code}: {message}")

# Specific MCP server integrations
class CRMServer:
    """Integration with Customer Relationship Management system"""
    
    def __init__(self, mcp_client: MCPClient):
        self.mcp = mcp_client
        self.server_name = 'crm'
    
    async def get_customer_info(self, phone_number: str) -> Dict:
        """Get customer information by phone number"""
        return await self.mcp.call_tool(
            self.server_name,
            'get_customer',
            {'phone_number': phone_number}
        )
    
    async def create_ticket(self, customer_id: str, subject: str, description: str) -> Dict:
        """Create a support ticket"""
        return await self.mcp.call_tool(
            self.server_name,
            'create_ticket',
            {
                'customer_id': customer_id,
                'subject': subject,
                'description': description,
                'priority': 'normal',
                'channel': 'voice'
            }
        )
    
    async def update_customer_info(self, customer_id: str, updates: Dict) -> Dict:
        """Update customer information"""
        return await self.mcp.call_tool(
            self.server_name,
            'update_customer',
            {'customer_id': customer_id, 'updates': updates}
        )

class OrderServer:
    """Integration with Order Management system"""
    
    def __init__(self, mcp_client: MCPClient):
        self.mcp = mcp_client
        self.server_name = 'orders'
    
    async def get_order_status(self, order_id: str) -> Dict:
        """Get order status and tracking information"""
        return await self.mcp.call_tool(
            self.server_name,
            'get_order',
            {'order_id': order_id}
        )
    
    async def get_customer_orders(self, customer_id: str, limit: int = 10) -> Dict:
        """Get recent orders for a customer"""
        return await self.mcp.call_tool(
            self.server_name,
            'get_customer_orders',
            {'customer_id': customer_id, 'limit': limit}
        )
    
    async def initiate_return(self, order_id: str, items: List[Dict], reason: str) -> Dict:
        """Initiate a return for order items"""
        return await self.mcp.call_tool(
            self.server_name,
            'initiate_return',
            {
                'order_id': order_id,
                'items': items,
                'reason': reason
            }
        )

class BookingServer:
    """Integration with Booking/Appointment system"""
    
    def __init__(self, mcp_client: MCPClient):
        self.mcp = mcp_client
        self.server_name = 'booking'
    
    async def get_available_slots(self, service_type: str, date: str) -> Dict:
        """Get available appointment slots"""
        return await self.mcp.call_tool(
            self.server_name,
            'get_availability',
            {'service_type': service_type, 'date': date}
        )
    
    async def book_appointment(self, customer_id: str, service_type: str, 
                              datetime_slot: str, notes: str = "") -> Dict:
        """Book an appointment"""
        return await self.mcp.call_tool(
            self.server_name,
            'book_appointment',
            {
                'customer_id': customer_id,
                'service_type': service_type,
                'datetime': datetime_slot,
                'notes': notes
            }
        )
    
    async def cancel_appointment(self, appointment_id: str, reason: str) -> Dict:
        """Cancel an existing appointment"""
        return await self.mcp.call_tool(
            self.server_name,
            'cancel_appointment',
            {'appointment_id': appointment_id, 'reason': reason}
        )

# Configuration helper
def load_mcp_config() -> Dict:
    """Load MCP server configuration from environment or config file"""
    return {
        'servers': {
            'crm': {
                'url': os.getenv('CRM_MCP_URL', 'http://localhost:8001/mcp'),
                'api_key': os.getenv('CRM_API_KEY', ''),
                'enabled': os.getenv('CRM_ENABLED', 'true').lower() == 'true'
            },
            'orders': {
                'url': os.getenv('ORDERS_MCP_URL', 'http://localhost:8002/mcp'),
                'api_key': os.getenv('ORDERS_API_KEY', ''),
                'enabled': os.getenv('ORDERS_ENABLED', 'true').lower() == 'true'
            },
            'booking': {
                'url': os.getenv('BOOKING_MCP_URL', 'http://localhost:8003/mcp'),
                'api_key': os.getenv('BOOKING_API_KEY', ''),
                'enabled': os.getenv('BOOKING_ENABLED', 'true').lower() == 'true'
            }
        },
        'timeout': int(os.getenv('MCP_TIMEOUT', '30')),
        'max_retries': int(os.getenv('MCP_MAX_RETRIES', '3'))
    }

# Example usage
async def example_usage():
    """Example of how to use the MCP client"""
    
    config = load_mcp_config()
    
    async with MCPClient(config) as mcp:
        # Initialize server clients
        crm = CRMServer(mcp)
        orders = OrderServer(mcp)
        booking = BookingServer(mcp)
        
        try:
            # Get customer info
            customer = await crm.get_customer_info('+1234567890')
            print(f"Customer: {customer}")
            
            # Check recent orders
            if customer.get('customer_id'):
                recent_orders = await orders.get_customer_orders(customer['customer_id'])
                print(f"Recent orders: {recent_orders}")
            
            # Get available appointments
            availability = await booking.get_available_slots('consultation', '2025-09-01')
            print(f"Available slots: {availability}")
            
        except MCPError as e:
            print(f"MCP Error: {e}")
        except Exception as e:
            print(f"Unexpected error: {e}")

if __name__ == "__main__":
    asyncio.run(example_usage())
```

### Step 2: Integrate MCP with Conversation Orchestrator

**Update `ai-engine/conversation_orchestrator.py` to include MCP integration:**
```python
# Add these imports at the top
import sys
import os
sys.path.append('../mcp-integration')
from mcp_client import MCPClient, CRMServer, OrderServer, BookingServer, load_mcp_config

# Update the ConversationOrchestrator class:
class ConversationOrchestrator:
    def __init__(self, config: Dict):
        # ... existing initialization code ...
        
        # Initialize MCP client
        self.mcp_config = load_mcp_config()
        self.mcp_client = None
        
    async def initialize_mcp(self):
        """Initialize MCP client - call this at startup"""
        self.mcp_client = MCPClient(self.mcp_config)
        await self.mcp_client.__aenter__()
        
        # Initialize server clients
        self.crm_server = CRMServer(self.mcp_client)
        self.order_server = OrderServer(self.mcp_client)
        self.booking_server = BookingServer(self.mcp_client)
    
    async def cleanup_mcp(self):
        """Cleanup MCP client - call this at shutdown"""
        if self.mcp_client:
            await self.mcp_client.__aexit__(None, None, None)

    # Add new method for executing actions
    async def execute_actions(self, intent_analysis: Dict, conversation: Dict) -> List[Dict]:
        """Execute required actions based on intent analysis"""
        executed_actions = []
        required_actions = intent_analysis.get('required_actions', [])
        entities = intent_analysis.get('entities', {})
        
        for action in required_actions:
            try:
                if action == 'check_order' and 'order_id' in entities:
                    result = await self.order_server.get_order_status(entities['order_id'])
                    executed_actions.append({
                        'type': 'order_lookup',
                        'order_id': entities['order_id'],
                        'result': result,
                        'success': True
                    })
                
                elif action == 'get_customer_info':
                    # Get phone number from conversation context
                    phone = conversation.get('customer_phone')
                    if phone:
                        result = await self.crm_server.get_customer_info(phone)
                        conversation['customer_info'] = result
                        executed_actions.append({
                            'type': 'customer_lookup',
                            'phone': phone,
                            'result': result,
                            'success': True
                        })
                
                elif action == 'book_appointment' and all(k in entities for k in ['service_type', 'date']):
                    customer_id = conversation.get('customer_info', {}).get('customer_id')
                    if customer_id:
                        result = await self.booking_server.book_appointment(
                            customer_id,
                            entities['service_type'],
                            entities['date'],
                            entities.get('notes', '')
                        )
                        executed_actions.append({
                            'type': 'booking',
                            'service_type': entities['service_type'],
                            'date': entities['date'],
                            'result': result,
                            'success': True
                        })
                
            except Exception as e:
                logger.error(f"Error executing action {action}: {str(e)}")
                executed_actions.append({
                    'type': action,
                    'error': str(e),
                    'success': False
                })
        
        return executed_actions

    # Update the generate_response method:
    async def generate_response(self, intent_analysis: Dict, conversation: Dict) -> Dict:
        """Generate an appropriate response based on the customer's intent"""
        
        intent = intent_analysis.get('intent', 'OTHER')
        entities = intent_analysis.get('entities', {})
        required_actions = intent_analysis.get('required_actions', [])
        
        # Get the latest customer message
        latest_message = conversation['messages'][-1]['content'] if conversation['messages'] else ""
        
        # Execute required actions (MCP calls)
        executed_actions = []
        if required_actions and self.mcp_client:
            executed_actions = await self.execute_actions(intent_analysis, conversation)
        
        # Search knowledge base if needed
        knowledge_results = []
        if 'search_knowledge' in required_actions or intent in ['INQUIRY', 'TECHNICAL_SUPPORT']:
            knowledge_results = await self.search_knowledge(latest_message, conversation)
        
        # Build conversation history for context
        messages = [{"role": "system", "content": self.system_prompt}]
        
        # Add action results as context
        if executed_actions:
            action_context = "Action Results:\n"
            for action in executed_actions:
                if action['success']:
                    action_context += f"- {action['type']}: Successfully completed\n"
                    if 'result' in action:
                        # Add relevant parts of the result
                        result = action['result']
                        if action['type'] == 'order_lookup':
                            action_context += f"  Order Status: {result.get('status', 'N/A')}\n"
                            action_context += f"  Tracking: {result.get('tracking_number', 'N/A')}\n"
                        elif action['type'] == 'customer_lookup':
                            action_context += f"  Customer: {result.get('name', 'N/A')}\n"
                            action_context += f"  Account Status: {result.get('status', 'N/A')}\n"
                        elif action['type'] == 'booking':
                            action_context += f"  Appointment ID: {result.get('appointment_id', 'N/A')}\n"
                            action_context += f"  Scheduled: {result.get('datetime', 'N/A')}\n"
                else:
                    action_context += f"- {action['type']}: Failed - {action.get('error', 'Unknown error')}\n"
            
            messages.append({
                "role": "system", 
                "content": f"Use this information in your response:\n{action_context}"
            })
        
        # Add knowledge base results as context if found
        if knowledge_results:
            knowledge_context = "Relevant company information:\n"
            for result in knowledge_results:
                knowledge_context += f"- {result['metadata']['title']}: {result['content']}\n"
            
            messages.append({
                "role": "system", 
                "content": f"Use this information to help answer the customer's question:\n{knowledge_context}"
            })
        
        # Add recent conversation history
        for msg in conversation['messages'][-10:]:
            messages.append({
                "role": msg['role'],
                "content": msg['content']
            })
        
        # Add intent analysis as context
        context_message = f"""
Intent Analysis:
- Intent: {intent}
- Entities: {entities}
- Actions Executed: {len(executed_actions)} successful, {len([a for a in executed_actions if not a['success']])} failed
- Knowledge Base Results: {len(knowledge_results)} relevant documents found

Please respond appropriately to the customer's request. If actions were executed successfully,
incorporate the results into your response. If actions failed, apologize and offer alternatives.
Keep responses conversational and under 75 words when possible.
"""
        
        messages.append({"role": "system", "content": context_message})
        
        try:
            # Generate response using the AI model
            if self.default_model.startswith('gpt'):
                response = await self.openai_client.chat.completions.acreate(
                    model=self.default_model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=200
                )
                response_text = response.choices[0].message.content
            else:
                # Use Anthropic Claude
                message_text = "\n".join([msg["content"] for msg in messages if msg["role"] == "user"])
                response = await self.anthropic_client.messages.create(
                    model="claude-3-sonnet-20240229",
                    max_tokens=200,
                    messages=[{"role": "user", "content": message_text}]
                )
                response_text = response.content[0].text
            
            return {
                'text': response_text.strip(),
                'intent': intent,
                'actions': executed_actions,
                'escalate': False,
                'knowledge_used': len(knowledge_results) > 0
            }
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            conversation['escalation_count'] += 1
            return {
                'text': "I'm sorry, I'm having trouble with that request. Let me try to help you in a different way, or I can connect you with a human agent.",
                'escalate': True
            }
```

---

## Phase 6: User Interfaces

### Step 1: Admin Dashboard (React Frontend)

**Create `frontend/package.json`:**
```json
{
  "name": "corecomm-dashboard",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.15.0",
    "axios": "^1.5.0",
    "recharts": "^2.8.0",
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@mui/material": "^5.14.0",
    "@mui/icons-material": "^5.14.0",
    "socket.io-client": "^4.7.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "devDependencies": {
    "react-scripts": "5.0.1"
  }
}
```

**Create `frontend/src/App.js`:**
```javascript
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Import components
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import ConversationMonitor from './components/ConversationMonitor';
import KnowledgeBase from './components/KnowledgeBase';
import Settings from './components/Settings';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Verify token with backend
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const---

## Phase 4: AI Engine

### Step 1: Conversation Orchestrator

**Create `ai-engine/conversation-orchestrator.py`:**
```python
import asyncio
import json
import logging
from typing import Dict, List, Optional
from datetime import datetime
import openai
from anthropic import Anthropic

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ConversationOrchestrator:
    """
    This is the brain of our AI system. It:
    1. Understands what customers are asking
    2. Decides what information to retrieve
    3. Determines what actions to take
    4. Generates appropriate responses
    """
    
    def __init__(self, config: Dict):
        # Initialize AI clients
        self.openai_client = openai.OpenAI(api_key=config.get('openai_api_key'))
        self.anthropic_client = Anthropic(api_key=config.get('anthropic_api_key'))
        
        # Configuration
        self.default_model = config.get('default_model', 'gpt-4')
        self.confidence_threshold = config.get('confidence_threshold', 0.7)
        self.escalation_keywords = config.get('escalation_keywords', [
            'speak to human', 'human agent', 'manager', 'supervisor', 
            'complaint', 'angry', 'frustrated'
        ])
        
        # Active conversations
        self.conversations = {}
        
        # System prompt that defines the AI's personality and capabilities
        self.system_prompt = """
You are a helpful AI customer service agent for CoreComm. Your role is to:

1. Greet customers warmly and professionally
2. Listen carefully to their requests and questions
3. Provide accurate information based on the knowledge you have access to
4. Perform actions when requested (like checking orders, booking appointments)
5. Escalate to human agents when necessary

Guidelines:
- Be concise but friendly in your responses
- Always confirm information before taking actions
- If you're unsure about something, say so and offer to get help
- Maintain customer privacy and security at all times
- If a customer seems frustrated, offer to connect them with a human agent

You can access company knowledge and perform actions through function calls.
Always cite your sources when providing specific information.
"""

    async def process_message(self, call_sid: str, message: str, confidence: float) -> Dict:
        """
        Process a customer message and generate a response
        
        Args:
            call_sid: Unique identifier for the phone call
            message: What the customer said (transcribed)
            confidence: How confident we are in the transcription
            
        Returns:
            Dict with response text and any actions to take
        """
        try:
            logger.info(f"Processing message for call {call_sid}: '{message}' (confidence: {confidence})")
            
            # Get or create conversation context
            conversation = self.get_conversation(call_sid)
            
            # Add customer message to conversation history
            conversation['messages'].append({
                'role': 'user',
                'content': message,
                'timestamp': datetime.now().isoformat(),
                'confidence': confidence
            })
            
            # Check if we should escalate based on keywords or low confidence
            if self.should_escalate(message, confidence, conversation):
                return await self.handle_escalation(call_sid, conversation)
            
            # Analyze the message to understand intent
            intent_analysis = await self.analyze_intent(message, conversation)
            
            # Generate response based on intent
            response = await self.generate_response(intent_analysis, conversation)
            
            # Add AI response to conversation history
            conversation['messages'].append({
                'role': 'assistant',
                'content': response['text'],
                'timestamp': datetime.now().isoformat(),
                'intent': intent_analysis.get('intent'),
                'actions': response.get('actions', [])
            })
            
            return response
            
        except Exception as e:
            logger.error(f"Error processing message: {str(e)}")
            return {
                'text': "I'm sorry, I'm having trouble processing your request right now. Let me connect you with a human agent.",
                'escalate': True
            }
    
    def get_conversation(self, call_sid: str) -> Dict:
        """Get or create conversation context for a call"""
        if call_sid not in self.conversations:
            self.conversations[call_sid] = {
                'call_sid': call_sid,
                'started_at': datetime.now().isoformat(),
                'messages': [],
                'context': {},
                'customer_info': {},
                'escalation_count': 0
            }
        return self.conversations[call_sid]
    
    def should_escalate(self, message: str, confidence: float, conversation: Dict) -> bool:
        """Determine if we should escalate to a human agent"""
        
        # Escalate if transcription confidence is too low
        if confidence < self.confidence_threshold:
            logger.info(f"Escalating due to low confidence: {confidence}")
            return True
        
        # Escalate if customer uses escalation keywords
        message_lower = message.lower()
        for keyword in self.escalation_keywords:
            if keyword in message_lower:
                logger.info(f"Escalating due to keyword: {keyword}")
                return True
        
        # Escalate if conversation is going in circles
        if conversation['escalation_count'] >= 3:
            logger.info("Escalating due to multiple failed attempts")
            return True
        
        return False
    
    async def analyze_intent(self, message: str, conversation: Dict) -> Dict:
        """
        Analyze the customer's message to understand their intent
        This helps us decide what information to retrieve and what actions to take
        """
        
        # Build conversation history for context
        recent_messages = conversation['messages'][-5:]  # Last 5 messages for context
        context = ""
        for msg in recent_messages:
            role = "Customer" if msg['role'] == 'user' else "Agent"
            context += f"{role}: {msg['content']}\n"
        
        prompt = f"""
Analyze this customer service conversation and determine the customer's intent.

Conversation context:
{context}

Current customer message: "{message}"

Classify the intent into one of these categories:
1. GREETING - Customer is saying hello or starting conversation
2. INQUIRY - Customer wants information (product details, policies, etc.)
3. ORDER_STATUS - Customer wants to check order status
4. BOOKING - Customer wants to book/schedule something
5. TECHNICAL_SUPPORT - Customer has technical issues
6. COMPLAINT - Customer has a complaint or problem
7. ACCOUNT_MANAGEMENT - Customer wants to update account info
8. PAYMENT_INQUIRY - Customer has questions about billing/payments
9. OTHER - Doesn't fit other categories

Also identify:
- Key entities (order numbers, product names, dates, etc.)
- Required actions (search knowledge base, check order, etc.)
- Urgency level (low, medium, high)

Respond in JSON format:
{{
    "intent": "category_name",
    "entities": {{"entity_type": "value"}},
    "required_actions": ["action1", "action2"],
    "urgency": "level",
    "confidence": 0.0-1.0
}}
"""
        
        try:
            response = await self.openai_client.chat.completions.acreate(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1  # Low temperature for consistent classification
            )
            
            result = json.loads(response.choices[0].message.content)
            logger.info(f"Intent analysis: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing intent: {str(e)}")
            return {
                "intent": "OTHER",
                "entities": {},
                "required_actions": [],
                "urgency": "medium",
                "confidence": 0.5
            }
    
    async def generate_response(self, intent_analysis: Dict, conversation: Dict) -> Dict:
        """
        Generate an appropriate response based on the customer's intent
        """
        
        intent = intent_analysis.get('intent', 'OTHER')
        entities = intent_analysis.get('entities', {})
        required_actions = intent_analysis.get('required_actions', [])
        
        # Build conversation history for context
        messages = [{"role": "system", "content": self.system_prompt}]
        
        # Add recent conversation history
        for msg in conversation['messages'][-10:]:  # Last 10 messages
            messages.append({
                "role": msg['role'],
                "content": msg['content']
            })
        
        # Add intent analysis as context
        context_message = f"""
Intent Analysis:
- Intent: {intent}
- Entities: {entities}
- Required Actions: {required_actions}
- Urgency: {intent_analysis.get('urgency', 'medium')}

Please respond appropriately to the customer's request. If you need to perform actions 
(like checking an order or searching the knowledge base), mention what you're doing.
Keep responses conversational and under 50 words when possible.
"""
        
        messages.append({"role": "system", "content": context_message})
        
        try:
            # Generate response using the AI model
            if self.default_model.startswith('gpt'):
                response = await self.openai_client.chat.completions.acreate(
                    model=self.default_model,
                    messages=messages,
                    temperature=0.7,
                    max_tokens=200
                )
                response_text = response.choices[0].message.content
            else:
                # Use Anthropic Claude
                message_text = "\n".join([msg["content"] for msg in messages if msg["role"] == "user"])
                response = await self.anthropic_client.messages.create(
                    model="claude-3-sonnet-20240229",
                    max_tokens=200,
                    messages=[{"role": "user", "content": message_text}]
                )
                response_text = response.content[0].text
            
            # TODO: Execute required actions (we'll implement this in the next step)
            executed_actions = []
            for action in required_actions:
                if action == "search_knowledge":
                    # We'll implement knowledge search later
                    pass
                elif action == "check_order":
                    # We'll implement order checking later
                    pass
            
            return {
                'text': response_text.strip(),
                'intent': intent,
                'actions': executed_actions,
                'escalate': False
            }
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            conversation['escalation_count'] += 1
            return {
                'text': "I'm sorry, I'm having trouble with that request. Let me try to help you in a different way, or I can connect you with a human agent.",
                'escalate': True
            }
    
    async def handle_escalation(self, call_sid: str, conversation: Dict) -> Dict:
        """Handle escalation to human agent"""
        
        # Prepare context for human agent
        context_summary = self.prepare_agent_context(conversation)
        
        return {
            'text': "I understand you'd like to speak with a human agent. Let me connect you right away. Please hold on for just a moment.",
            'escalate': True,
            'agent_context': context_summary
        }
    
    def prepare_agent_context(self, conversation: Dict) -> Dict:
        """Prepare context information for human agent handoff"""
        
        # Summarize the conversation
        messages = conversation.get('messages', [])
        customer_messages = [msg['content'] for msg in messages if msg['role'] == 'user']
        ai_responses = [msg['content'] for msg in messages if msg['role'] == 'assistant']
        
        # Get the last stated intent
        last_intent = None
        for msg in reversed(messages):
            if msg['role'] == 'assistant' and 'intent' in msg:
                last_intent = msg['intent']
                break
        
        return {
            'call_sid': conversation['call_sid'],
            'conversation_started': conversation['started_at'],
            'message_count': len(messages),
            'last_intent': last_intent,
            'customer_requests': customer_messages[-3:],  # Last 3 customer messages
            'ai_responses': ai_responses[-3:],  # Last 3 AI responses
            'escalation_reason': 'customer_request',  # Could be 'low_confidence', 'keywords', etc.
            'customer_info': conversation.get('customer_info', {})
        }

# Usage example and API wrapper
class ConversationAPI:
    """FastAPI wrapper for the conversation orchestrator"""
    
    def __init__(self):
        config = {
            'openai_api_key': os.getenv('OPENAI_API_KEY'),
            'anthropic_api_key': os.getenv('ANTHROPIC_API_KEY'),
            'default_model': 'gpt-4',
            'confidence_threshold': 0.7
        }
        self.orchestrator = ConversationOrchestrator(config)
    
    async def process_voice_message(self, call_sid: str, message: str, confidence: float):
        """API endpoint for processing voice messages"""
        return await self.orchestrator.process_message(call_sid, message, confidence)
    
    def get_conversation_history(self, call_sid: str):
        """Get conversation history for a call"""
        return self.orchestrator.conversations.get(call_sid, {})
    
    def end_conversation(self, call_sid: str):
        """Clean up when conversation ends"""
        if call_sid in self.orchestrator.conversations:
            conversation = self.orchestrator.conversations[call_sid]
            conversation['ended_at'] = datetime.now().isoformat()
            # TODO: Save to database
            del self.orchestrator.conversations[call_sid]
```

**Create `ai-engine/main.py` (FastAPI server):**
```python
import os
import asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import uvicorn

from conversation_orchestrator import ConversationAPI

# Initialize FastAPI app
app = FastAPI(title="CoreComm AI Engine", version="1.0.0")

# Initialize conversation API
conversation_api = ConversationAPI()

# Request/Response models
class VoiceMessageRequest(BaseModel):
    call_sid: str
    message: str
    confidence: float

class VoiceMessageResponse(BaseModel):
    text: str
    intent: Optional[str] = None
    escalate: bool = False
    agent_context: Optional[dict] = None

@app.post("/process-message", response_model=VoiceMessageResponse)
async def process_voice_message(request: VoiceMessageRequest):
    """
    Process a voice message from a customer
    This is called by the voice processing system when it transcribes speech
    """
    try:
        result = await conversation_api.process_voice_message(
            request.call_sid, 
            request.message, 
            request.confidence
        )
        
        return VoiceMessageResponse(**result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/conversation/{call_sid}")
async def get_conversation(call_sid: str):
    """Get conversation history for a call"""
    conversation = conversation_api.get_conversation_history(call_sid)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation

@app.post("/conversation/{call_sid}/end")
async def end_conversation(call_sid: str):
    """End a conversation and clean up"""
    conversation_api.end_conversation(call_sid)
    return {"message": "Conversation ended"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "CoreComm AI Engine"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Step 2: Knowledge Retrieval (RAG) System

**Create `ai-engine/knowledge_base.py`:**
```python
import chromadb
import logging
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Optional
import json
import os

logger = logging.getLogger(__name__)

class KnowledgeBase:
    """
    This system stores and retrieves company knowledge to answer customer questions
    It uses vector embeddings to find relevant information based on semantic similarity
    """
    
    def __init__(self, db_path: str = "./chroma_db"):
        # Initialize ChromaDB (vector database)
        self.client = chromadb.PersistentClient(path=db_path)
        
        # Initialize embedding model for converting text to vectors
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Get or create collection for company knowledge
        self.collection = self.client.get_or_create_collection(
            name="company_knowledge",
            metadata={"description": "Company knowledge base for customer support"}
        )
        
        logger.info(f"Knowledge base initialized with {self.collection.count()} documents")
    
    def add_document(self, content: str, metadata: Dict, doc_id: str = None) -> str:
        """
        Add a document to the knowledge base
        
        Args:
            content: The text content of the document
            metadata: Information about the document (title, category, etc.)
            doc_id: Optional custom ID for the document
            
        Returns:
            Document ID
        """
        try:
            # Generate embedding for the content
            embedding = self.embedding_model.encode(content).tolist()
            
            # Generate ID if not provided
            if not doc_id:
                doc_id = f"doc_{self.collection.count() + 1}"
            
            # Add to vector database
            self.collection.add(
                embeddings=[embedding],
                documents=[content],
                metadatas=[metadata],
                ids=[doc_id]
            )
            
            logger.info(f"Added document {doc_id} to knowledge base")
            return doc_id
            
        except Exception as e:
            logger.error(f"Error adding document: {str(e)}")
            raise
    
    def search(self, query: str, limit: int = 5, min_similarity: float = 0.7) -> List[Dict]:
        """
        Search for relevant documents based on a query
        
        Args:
            query: The search query
            limit: Maximum number of results to return
            min_similarity: Minimum similarity score (0-1)
            
        Returns:
            List of relevant documents with metadata
        """
        try:
            # Generate embedding for the query
            query_embedding = self.embedding_model.encode(query).tolist()
            
            # Search the vector database
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=limit
            )
            
            # Format results
            documents = []
            for i, (doc, metadata, distance) in enumerate(zip(
                results['documents'][0],
                results['metadatas'][0], 
                results['distances'][0]
            )):
                # Convert distance to similarity score (lower distance = higher similarity)
                similarity = 1 - distance
                
                if similarity >= min_similarity:
                    documents.append({
                        'content': doc,
                        'metadata': metadata,
                        'similarity': similarity,
                        'rank': i + 1
                    })
            
            logger.info(f"Found {len(documents)} relevant documents for query: '{query}'")
            return documents
            
        except Exception as e:
            logger.error(f"Error searching knowledge base: {str(e)}")
            return []
    
    def update_document(self, doc_id: str, content: str = None, metadata: Dict = None):
        """Update an existing document"""
        try:
            if content:
                embedding = self.embedding_model.encode(content).tolist()
                self.collection.update(
                    ids=[doc_id],
                    embeddings=[embedding],
                    documents=[content],
                    metadatas=[metadata] if metadata else None
                )
            elif metadata:
                self.collection.update(
                    ids=[doc_id],
                    metadatas=[metadata]
                )
            
            logger.info(f"Updated document {doc_id}")
            
        except Exception as e:
            logger.error(f"Error updating document: {str(e)}")
            raise
    
    def delete_document(self, doc_id: str):
        """Delete a document from the knowledge base"""
        try:
            self.collection.delete(ids=[doc_id])
            logger.info(f"Deleted document {doc_id}")
        except Exception as e:
            logger.error(f"Error deleting document: {str(e)}")
            raise
    
    def load_from_directory(self, directory_path: str):
        """
        Load documents from a directory of text files
        This is useful for initial setup
        """
        if not os.path.exists(directory_path):
            logger.warning(f"Directory {directory_path} does not exist")
            return
        
        for filename in os.listdir(directory_path):
            if filename.endswith('.txt'):
                filepath = os.path.join(directory_path, filename)
                with open(filepath, 'r', encoding='utf-8') as file:
                    content = file.read()
                    
                    metadata = {
                        'filename': filename,
                        'category': 'general',
                        'source': 'file_upload'
                    }
                    
                    doc_id = filename.replace('.txt', '')
                    self.add_document(content, metadata, doc_id)
        
        logger.info(f"Loaded documents from {directory_path}")

# Example usage and testing
def setup_sample_knowledge_base():
    """Set up a sample knowledge base with common customer service information"""
    
    kb = KnowledgeBase()
    
    # Sample company information
    sample_docs = [
        {
            "content": "Our company offers 24/7 customer support through phone, email, and live chat. You can reach us at 1-800-SUPPORT or support@company.com",
            "metadata": {"category": "contact_info", "title": "Customer Support Hours"}
        },
        {
            "content": "We offer a 30-day money-back guarantee on all products. To initiate a return, contact customer service with your order number.",
            "metadata": {"category": "returns", "title": "Return Policy"}
        },
        {
            "content": "Shipping typically takes 3-5 business days for standard delivery and 1-2 business days for express delivery. International shipping may take 7-14 business days.",
            "metadata": {"category": "shipping", "title": "Shipping Information"}
        },
        {
            "content": "To track your order, you can use the tracking number provided in your shipping confirmation email on our website's# CoreComm AI Voice Agent Platform - Developer Manual

## Table of Contents
1. [Project Overview](#project-overview)
2. [Prerequisites & Setup](#prerequisites--setup)
3. [Development Environment](#development-environment)
4. [Phase 1: Project Foundation](#phase-1-project-foundation)
5. [Phase 2: Core Infrastructure](#phase-2-core-infrastructure)
6. [Phase 3: Voice Processing](#phase-3-voice-processing)
7. [Phase 4: AI Engine](#phase-4-ai-engine)
8. [Phase 5: MCP Integration](#phase-5-mcp-integration)
9. [Phase 6: User Interfaces](#phase-6-user-interfaces)
10. [Phase 7: Testing & Quality](#phase-7-testing--quality)
11. [Phase 8: Deployment](#phase-8-deployment)
12. [Troubleshooting Guide](#troubleshooting-guide)

---

## Project Overview

CoreComm is an AI-powered voice customer support platform that handles phone calls using conversational AI. The system processes speech in real-time, understands customer requests, retrieves information, performs actions, and responds naturally - all while maintaining enterprise-grade security.

### What We're Building
- **Voice-first customer support** that answers phone calls automatically
- **Real-time speech processing** that understands and responds to customers
- **Knowledge integration** that pulls from company databases and documents
- **Action execution** that can perform tasks like checking orders or booking appointments
- **Human handoff** when the AI can't resolve issues
- **Multi-tenant architecture** supporting multiple client companies

---

## Prerequisites & Setup

### Required Knowledge (Don't worry if you're new to these - we'll learn together!)
- Basic programming concepts (variables, functions, loops)
- Understanding of web technologies (HTTP requests, APIs)
- Familiarity with command line/terminal
- Basic understanding of databases

### Tools You'll Need to Install

#### 1. **Development Environment**
```bash
# Install Node.js (JavaScript runtime)
# Visit https://nodejs.org and download LTS version
# This allows us to run JavaScript on servers, not just browsers

# Install Python (for AI/ML components)
# Visit https://python.org and download version 3.9+
# Python is great for AI and machine learning tasks

# Install Git (version control)
# Visit https://git-scm.com
# Git helps us track changes and collaborate on code
```

#### 2. **Code Editor**
```bash
# Install Visual Studio Code
# Visit https://code.visualstudio.com
# This is where you'll write your code

# Recommended Extensions:
# - Python
# - JavaScript (ES6) code snippets
# - REST Client
# - Docker
# - AWS Toolkit
```

#### 3. **Database Tools**
```bash
# Install PostgreSQL
# Visit https://postgresql.org
# This is our main database for storing customer data

# Install Redis
# Visit https://redis.io
# This stores temporary data for fast access
```

#### 4. **Cloud Tools**
```bash
# Install AWS CLI
# Visit https://aws.amazon.com/cli/
# This lets us interact with Amazon Web Services

# Install Docker
# Visit https://docker.com
# This packages our code so it runs the same everywhere
```

### Setting Up Your AWS Account
```bash
# 1. Create AWS Account at aws.amazon.com
# 2. Set up IAM user (don't use root account for development)
# 3. Install AWS CLI and configure:
aws configure
# Enter your Access Key ID, Secret Key, Region (us-east-1), Output format (json)
```

---

## Development Environment

### Project Structure Setup

#### 1. **Create Main Project Directory**
```bash
# Open terminal/command prompt
mkdir corecomm-platform
cd corecomm-platform

# Initialize Git repository
git init
```

#### 2. **Create Folder Structure**
```bash
# Create these folders - each serves a specific purpose:
mkdir backend          # Server-side code
mkdir frontend         # Web interfaces (admin dashboard)
mkdir ai-engine        # AI and machine learning code
mkdir voice-processing # Speech-to-text and text-to-speech
mkdir mcp-integration  # Connections to external systems
mkdir infrastructure   # AWS setup and configuration
mkdir tests           # Test code to verify everything works
mkdir docs            # Documentation
mkdir scripts         # Automation scripts
```

#### 3. **Set Up Each Component**

**Backend Setup (Node.js/Express):**
```bash
cd backend
npm init -y
# This creates package.json - thinks of it as a recipe card for your project

# Install essential packages:
npm install express          # Web server framework
npm install cors            # Allows frontend to talk to backend
npm install helmet          # Security middleware
npm install dotenv          # Manages environment variables
npm install bcrypt          # Password encryption
npm install jsonwebtoken    # User authentication
npm install pg              # PostgreSQL database connection
npm install redis           # Redis cache connection
npm install winston         # Logging (keeps track of what happens)

# Install development tools:
npm install --save-dev nodemon  # Automatically restarts server when code changes
npm install --save-dev jest     # Testing framework
```

**AI Engine Setup (Python):**
```bash
cd ../ai-engine
python -m venv venv
# This creates a virtual environment - like a separate workspace for Python

# Activate virtual environment:
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install AI packages:
pip install openai          # OpenAI API access
pip install anthropic       # Claude AI access
pip install langchain       # AI framework for building applications
pip install chromadb        # Vector database for knowledge storage
pip install sentence-transformers  # Text embeddings
pip install fastapi         # Fast web framework for Python
pip install uvicorn         # Server for FastAPI
```

**Voice Processing Setup:**
```bash
cd ../voice-processing
npm init -y

# Install voice processing packages:
npm install twilio          # Phone system integration
npm install @deepgram/sdk   # Speech-to-text service
npm install elevenlabs      # Text-to-speech service
npm install socket.io       # Real-time communication
npm install webrtc         # Web-based real-time communication
```

---

## Phase 1: Project Foundation

### Step 1: Basic Backend Server

**Create `backend/server.js`:**
```javascript
// This is our main server file - the heart of our backend
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Create our application
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware (functions that run before our main code)
app.use(helmet());        // Security headers
app.use(cors());          // Allow frontend to connect
app.use(express.json());  // Parse JSON data from requests

// Basic health check route
// When someone visits /health, they get a simple response
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'CoreComm Backend'
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`CoreComm Backend running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});
```

**Create `backend/.env` (Environment Variables):**
```bash
# This file stores sensitive information and configuration
# NEVER commit this file to Git!

# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (we'll fill these in later)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=corecomm
DB_USER=corecomm_user
DB_PASSWORD=your_secure_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# AI Service Keys (get these from the respective services)
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here

# Voice Service Keys
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
DEEPGRAM_API_KEY=your_deepgram_key
ELEVENLABS_API_KEY=your_elevenlabs_key

# Security
JWT_SECRET=your_very_secure_random_string_here
```

**Create `backend/package.json` scripts:**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  }
}
```

**Test Your First Server:**
```bash
cd backend
npm run dev
# Your server should start and show "CoreComm Backend running on port 3000"
# Open browser and go to http://localhost:3000/health
# You should see: {"status":"healthy","timestamp":"...","service":"CoreComm Backend"}
```

### Step 2: Database Setup

**Create `backend/database/schema.sql`:**
```sql
-- This creates our database structure
-- Think of tables like Excel spreadsheets with defined columns

-- Users table (for admin users, not customers)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tenants table (different client companies using our platform)
CREATE TABLE tenants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    configuration JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table (stores each phone call)
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id),
    customer_phone VARCHAR(20),
    session_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) DEFAULT 'active',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    escalated_to_human BOOLEAN DEFAULT FALSE,
    resolution_status VARCHAR(100)
);

-- Messages table (stores each message in a conversation)
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id),
    sender_type VARCHAR(20) NOT NULL, -- 'customer', 'ai', 'human'
    content TEXT,
    audio_url VARCHAR(500),
    confidence_score DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Knowledge base table (stores company information)
CREATE TABLE knowledge_base (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER REFERENCES tenants(id),
    title VARCHAR(255),
    content TEXT,
    embedding VECTOR(1536), -- for AI similarity search
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Actions table (tracks what actions the AI performed)
CREATE TABLE actions (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER REFERENCES conversations(id),
    action_type VARCHAR(100),
    action_data JSONB,
    result JSONB,
    success BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Create Database Setup Script `backend/database/setup.js`:**
```javascript
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database connection configuration
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function setupDatabase() {
    try {
        console.log('Setting up CoreComm database...');
        
        // Read and execute the schema file
        const schemaSQL = fs.readFileSync(
            path.join(__dirname, 'schema.sql'), 
            'utf8'
        );
        
        await pool.query(schemaSQL);
        console.log('Database schema created successfully!');
        
        // Insert sample data for testing
        await insertSampleData();
        
    } catch (error) {
        console.error('Database setup failed:', error);
    } finally {
        await pool.end();
    }
}

async function insertSampleData() {
    // Create a sample tenant (client company)
    const tenantResult = await pool.query(`
        INSERT INTO tenants (name, domain, phone_number, configuration)
        VALUES ($1, $2, $3, $4)
        RETURNING id
    `, [
        'Demo Company', 
        'demo.corecomm.com', 
        '+1234567890',
        JSON.stringify({
            voice_settings: { voice_id: 'default', speed: 1.0 },
            escalation_threshold: 0.7
        })
    ]);
    
    console.log(`Sample tenant created with ID: ${tenantResult.rows[0].id}`);
}

// Run the setup
setupDatabase();
```

**Run Database Setup:**
```bash
# First, make sure PostgreSQL is running
# Then create the database:
createdb corecomm

# Run our setup script:
node database/setup.js
```

### Step 3: Basic Authentication System

**Create `backend/middleware/auth.js`:**
```javascript
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// This middleware checks if a user is logged in
function authenticateToken(req, res, next) {
    // Get the token from the request header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        
        req.user = user; // Store user info for later use
        next(); // Continue to the next function
    });
}

// Function to hash passwords securely
async function hashPassword(password) {
    const saltRounds = 10; // How secure the encryption is
    return await bcrypt.hash(password, saltRounds);
}

// Function to check if password is correct
async function validatePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}

// Function to generate JWT token
function generateToken(user) {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' } // Token expires in 24 hours
    );
}

module.exports = {
    authenticateToken,
    hashPassword,
    validatePassword,
    generateToken
};
```

**Create `backend/routes/auth.js`:**
```javascript
const express = require('express');
const { Pool } = require('pg');
const { hashPassword, validatePassword, generateToken } = require('../middleware/auth');

const router = express.Router();

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, role = 'user' } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        
        // Check if user already exists
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );
        
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Hash password and create user
        const hashedPwd = await hashPassword(password);
        const result = await pool.query(`
            INSERT INTO users (email, password_hash, first_name, last_name, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, email, first_name, last_name, role
        `, [email, hashedPwd, firstName, lastName, role]);
        
        const user = result.rows[0];
        const token = generateToken(user);
        
        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role
            }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        
        // Find user by email
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = result.rows[0];
        
        // Check password
        const validPassword = await validatePassword(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Generate token
        const token = generateToken(user);
        
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
```

**Update `backend/server.js` to include auth routes:**
```javascript
// Add this after your existing middleware
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
```

---

## Phase 2: Core Infrastructure

### Step 1: VoIP Integration with Twilio

**Create `voice-processing/twilio-handler.js`:**
```javascript
const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;

// Initialize Twilio client
const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

class TwilioHandler {
    constructor() {
        this.activeStreams = new Map(); // Track active calls
    }
    
    // Handle incoming phone calls
    handleIncomingCall(req, res) {
        console.log('Incoming call from:', req.body.From);
        
        const twiml = new VoiceResponse();
        
        // Start media stream for real-time audio
        const start = twiml.start();
        start.stream({
            name: 'corecomm-stream',
            url: `wss://${req.headers.host}/voice-stream`
        });
        
        // Say a greeting while setting up the stream
        twiml.say({
            voice: 'alice',
            language: 'en-US'
        }, 'Hello! Please hold while I connect you to our AI assistant.');
        
        // Keep the call active
        twiml.pause({ length: 60 });
        
        res.type('text/xml');
        res.send(twiml.toString());
    }
    
    // Handle WebSocket connection for real-time audio
    handleMediaStream(ws, req) {
        console.log('Media stream connected');
        
        const callSid = null;
        let streamSid = null;
        
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                
                switch (data.event) {
                    case 'connected':
                        console.log('Stream connected:', data);
                        break;
                        
                    case 'start':
                        streamSid = data.streamSid;
                        callSid = data.start.callSid;
                        console.log(`Stream started: ${streamSid} for call: ${callSid}`);
                        
                        // Store stream info
                        this.activeStreams.set(callSid, {
                            streamSid,
                            ws,
                            startTime: new Date()
                        });
                        break;
                        
                    case 'media':
                        // This is audio data from the customer
                        this.processAudioData(callSid, data.media);
                        break;
                        
                    case 'stop':
                        console.log(`Stream stopped: ${streamSid}`);
                        this.activeStreams.delete(callSid);
                        break;
                }
            } catch (error) {
                console.error('Error processing media stream message:', error);
            }
        });
        
        ws.on('close', () => {
            console.log('Media stream disconnected');
            if (callSid) {
                this.activeStreams.delete(callSid);
            }
        });
    }
    
    // Process incoming audio data
    processAudioData(callSid, mediaData) {
        // Audio data is base64 encoded, 8-bit mu-law
        const audioBuffer = Buffer.from(mediaData.payload, 'base64');
        
        // TODO: Send to speech-to-text service
        console.log(`Received audio data for call ${callSid}: ${audioBuffer.length} bytes`);
        
        // For now, we'll just log it
        // Later we'll send this to Deepgram or OpenAI for transcription
    }
    
    // Send audio back to the caller
    sendAudio(callSid, audioData) {
        const stream = this.activeStreams.get(callSid);
        if (stream && stream.ws.readyState === 1) { // WebSocket.OPEN
            const message = {
                event: 'media',
                streamSid: stream.streamSid,
                media: {
                    payload: audioData.toString('base64')
                }
            };
            
            stream.ws.send(JSON.stringify(message));
        }
    }
    
    // End a call
    hangupCall(callSid) {
        const stream = this.activeStreams.get(callSid);
        if (stream) {
            stream.ws.close();
            this.activeStreams.delete(callSid);
        }
    }
}

module.exports = TwilioHandler;
```

**Create `voice-processing/server.js`:**
```javascript
const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const TwilioHandler = require('./twilio-handler');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Initialize Twilio handler
const twilioHandler = new TwilioHandler();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Route for incoming calls
app.post('/voice-webhook', (req, res) => {
    twilioHandler.handleIncomingCall(req, res);
});

// Handle WebSocket connections for media streams
wss.on('connection', (ws, req) => {
    if (req.url === '/voice-stream') {
        twilioHandler.handleMediaStream(ws, req);
    }
});

const PORT = process.env.VOICE_PORT || 3001;
server.listen(PORT, () => {
    console.log(`Voice processing server running on port ${PORT}`);
    console.log(`Webhook URL: http://localhost:${PORT}/voice-webhook`);
});
```

### Step 2: Speech-to-Text Integration

**Create `voice-processing/speech-services.js`:**
```javascript
const { createClient, LiveTranscriptionEvents } = require('@deepgram/sdk');
const OpenAI = require('openai');

class SpeechServices {
    constructor() {
        // Initialize Deepgram for speech-to-text
        this.deepgram = createClient(process.env.DEEPGRAM_API_KEY);
        
        // Initialize OpenAI for alternative STT and TTS
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        this.activeTranscriptions = new Map();
    }
    
    // Start real-time transcription with Deepgram
    async startTranscription(callSid, onTranscript, onError) {
        try {
            const connection = this.deepgram.listen.live({
                model: 'nova-2',
                language: 'en-US',
                smart_format: true,
                punctuate: true,
                interim_results: true,
                endpointing: 300 // End of speech detection
            });
            
            // Store the connection
            this.activeTranscriptions.set(callSid, connection);
            
            // Handle transcription results
            connection.on(LiveTranscriptionEvents.Transcript, (data) => {
                const transcript = data.channel.alternatives[0];
                
                if (transcript && transcript.transcript) {
                    const result = {
                        text: transcript.transcript,
                        confidence: transcript.confidence,
                        isFinal: data.is_final,
                        timestamp: new Date().toISOString()
                    };
                    
                    console.log(`Transcript (${callSid}):`, result);
                    onTranscript(result);
                }
            });
            
            // Handle errors
            connection.on(LiveTranscriptionEvents.Error, (error) => {
                console.error(`Transcription error for ${callSid}:`, error);
                onError(error);
            });
            
            // Handle connection close
            connection.on(LiveTranscriptionEvents.Close, () => {
                console.log(`Transcription closed for ${callSid}`);
                this.activeTranscriptions.delete(callSid);
            });
            
            return connection;
            
        } catch (error) {
            console.error('Failed to start transcription:', error);
            onError(error);
        }
    }
    
    // Send audio data to transcription service
    sendAudioToTranscription(callSid, audioBuffer) {
        const connection = this.activeTranscriptions.get(callSid);
        if (connection) {
            // Convert from mu-law to linear16 for better transcription
            const linearAudio = this.convertMuLawToLinear16(audioBuffer);
            connection.send(linearAudio);
        }
    }
    
    // Convert mu-law audio to linear16 (Deepgram prefers this format)
    convertMuLawToLinear16(muLawBuffer) {
        // This is a simplified conversion
        // In production, you might want to use a proper audio conversion library
        const linear16Buffer = Buffer.alloc(muLawBuffer.length * 2);
        
        for (let i = 0; i < muLawBuffer.length; i++) {
            // Basic mu-law to linear conversion
            const muLawSample = muLawBuffer[i];
            const sign = (muLawSample & 0x80) ? -1 : 1;
            const magnitude = muLawSample & 0x7F;
            const linear = sign * (Math.pow(256, magnitude / 127.0) - 1) * 32767 / 255;
            
            // Write as 16-bit little-endian
            linear16Buffer.writeInt16LE(Math.round(linear), i * 2);
        }
        
        return linear16Buffer;
    }
    
    // Stop transcription for a call
    stopTranscription(callSid) {
        const connection = this.activeTranscriptions.get(callSid);
        if (connection) {
            connection.requestClose();
            this.activeTranscriptions.delete(callSid);
        }
    }
    
    // Text-to-Speech using ElevenLabs
    async generateSpeech(text, voiceId = 'default') {
        try {
            // Using ElevenLabs for high-quality voice synthesis
            const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId, {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': process.env.ELEVENLABS_API_KEY
                },
                body: JSON.stringify({
                    text: text,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.5
                    }
                })
            });
            
            if (!response.ok) {
                throw new Error(`ElevenLabs API error: ${response.status}`);
            }
            
            const audioBuffer = await response.arrayBuffer();
            return Buffer.from(audioBuffer);
            
        } catch (error) {
            console.error('Text-to-speech error:', error);
            
            // Fallback to OpenAI TTS
            try {
                const mp3 = await this.openai.audio.speech.create({
                    model: 'tts-1',
                    voice: 'alloy',
                    input: text
                });
                
                const buffer = Buffer.from(await mp3.arrayBuffer());
                return buffer;
                
            } catch (fallbackError) {
                console.error('Fallback TTS also failed:', fallbackError);
                throw fallbackError;
            }
        }
    }
}

module.exports = SpeechServices;
```

---

## Phase 3: Voice Processing

### Step 3: Integrate Speech Services with Twilio

**Update `voice-processing/twilio-handler.js`:**
```javascript
const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;
const SpeechServices = require('./speech-services');

class TwilioHandler {
    constructor() {
        this.activeStreams = new Map();
        this.speechServices = new SpeechServices();
        this.conversationHandler = null; // We'll create this later
    }
    
    // Set conversation handler (will be created in AI engine phase)
    setConversationHandler(handler) {
        this.conversationHandler = handler;
    }
    
    handleIncomingCall(req, res) {
        console.log('Incoming call from:', req.body.From);
        
        // Create conversation record in database
        const callSid = req.body.CallSid;
        const customerPhone = req.body.From;
        
        const twiml = new VoiceResponse();
        
        // Start media stream
        const start = twiml.start();
        start.stream({
            name: 'corecomm-stream',
            url: `wss://${req.headers.host}/voice-stream`
        });
        
        // Initial greeting
        twiml.say({
            voice: 'alice',
            language: 'en-US'
        }, 'Hello! I\'m your AI assistant. How can I help you today?');
        
        // Keep the call active for conversation
        twiml.pause({ length: 60 });
        
        res.type('text/xml');
        res.send(twiml.toString());
    }
    
    handleMediaStream(ws, req) {
        console.log('Media stream connected');
        
        let callSid = null;
        let streamSid = null;
        
        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                
                switch (data.event) {
                    case 'connected':
                        console.log('Stream connected:', data);
                        break;
                        
                    case 'start':
                        streamSid = data.streamSid;
                        callSid = data.start.callSid;
                        console.log(`Stream started: ${streamSid} for call: ${callSid}`);
                        
                        // Store stream info
                        this.activeStreams.set(callSid, {
                            streamSid,
                            ws,
                            startTime: new Date(),
                            customerPhone: data.start.customParameters?.From
                        });
                        
                        // Start speech-to-text transcription
                        this.startTranscriptionForCall(callSid);
                        break;
                        
                    case 'media':
                        // Send audio data to transcription
                        this.speechServices.sendAudioToTranscription(
                            callSid, 
                            Buffer.from(data.media.payload, 'base64')
                        );
                        break;
                        
                    case 'stop':
                        console.log(`Stream stopped: ${streamSid}`);
                        this.speechServices.stopTranscription(callSid);
                        this.activeStreams.delete(callSid);
                        break;
                }
            } catch (error) {
                console.error('Error processing media stream message:', error);
            }
        });
        
        ws.on('close', () => {
            console.log('Media stream disconnected');
            if (callSid) {
                this.speechServices.stopTranscription(callSid);
                this.activeStreams.delete(callSid);
            }
        });
    }
    
    // Start transcription for a call
    async startTranscriptionForCall(callSid) {
        const onTranscript = (result) => {
            console.log(`Customer said: "${result.text}" (confidence: ${result.confidence})`);
            
            // Only process final transcripts to avoid partial responses
            if (result.isFinal && result.text.trim().length > 0) {
                this.handleCustomerMessage(callSid, result.text, result.confidence);
            }
        };
        
        const onError = (error) => {
            console.error(`Transcription error for call ${callSid}:`, error);
            // Could implement fallback or error handling here
        };
        
        await this.speechServices.startTranscription(callSid, onTranscript, onError);
    }
    
    // Handle customer's transcribed message
    async handleCustomerMessage(callSid, text, confidence) {
        try {
            // If we have a conversation handler (AI engine), use it
            if (this.conversationHandler) {
                const response = await this.conversationHandler.processMessage(
                    callSid, 
                    text, 
                    confidence
                );
                
                if (response && response.text) {
                    await this.speakToCustomer(callSid, response.text);
                }
            } else {
                // Simple echo response for testing
                await this.speakToCustomer(
                    callSid, 
                    `I heard you say: ${text}. How else can I help you?`
                );
            }
        } catch (error) {
            console.error('Error handling customer message:', error);
            await this.speakToCustomer(
                callSid, 
                "I'm sorry, I didn't catch that. Could you please repeat your question?"
            );
        }
    }
    
    // Convert text to speech and send to customer
    async speakToCustomer(callSid, text) {
        try {
            console.log(`Speaking to customer (${callSid}): "${text}"`);
            
            // Generate speech audio
            const audioBuffer = await this.speechServices.generateSpeech(text);
            
            // Convert to format suitable for Twilio (mu-law)
            const muLawAudio = this.convertToMuLaw(audioBuffer);
            
            // Send audio to customer
            this.sendAudio(callSid, muLawAudio);
            
        } catch (error) {
            console.error('Error speaking to customer:', error);
        }
    }
    
    // Convert audio to mu-law format for Twilio
    convertToMuLaw(audioBuffer) {
        // This is a simplified conversion
        // In production, you'd use a proper audio conversion library like 'node-wav'
        // For now, we'll return the buffer as-is and handle conversion later
        return audioBuffer;
    }
    
    // Send audio back to caller (existing method)
    sendAudio(callSid, audioData) {
        const stream = this.activeStreams.get(callSid);
        if (stream && stream.ws.readyState === 1) {
            const message = {
                event: 'media',
                streamSid: stream.streamSid,
                media: {
                    payload: audioData.toString('base64')
                }
            };
            
            stream.ws.send(JSON.stringify(message));
        }
    }
    
    // Transfer call to human agent
    async transferToHuman(callSid, context) {
        try {
            const stream = this.activeStreams.get(callSid);
            if (!stream) return;
            
            // Stop AI processing
            this.speechServices.stopTranscription(callSid);
            
            // Inform customer about transfer
            await this.speakToCustomer(
                callSid, 
                "Let me transfer you to one of our human agents who can better assist you. Please hold on."
            );
            
            // Use Twilio's API to redirect the call
            const client = twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );
            
            await client.calls(callSid).update({
                twiml: `<Response><Dial>${process.env.HUMAN_AGENT_NUMBER}</Dial></Response>`
            });
            
            console.log(`Call ${callSid} transferred to human agent`);
            
        } catch (error) {
            console.error('Error transferring to human:', error);
        }
    }
    
    // End call
    hangupCall(callSid) {
        const stream = this.activeStreams.get(callSid);
        if (stream) {
            this.speechServices.stopTranscription(callSid);
            stream.ws.close();
            this.activeStreams.delete(callSid);
        }
    }
}

module.exports = TwilioHandler;