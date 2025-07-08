const { db } = require('../config/firebase');
const { sendEmail, sendBulkEmail, emailTemplates } = require('../config/email');

class EmailService {
  // Send session notification to all users
  async sendSessionNotification(sessionData) {
    try {
      console.log('📧 Sending session notifications...');
      
      // Get all active users (mahasiswa and pengunjung)
      const usersSnapshot = await db
        .collection('users')
        .where('status', '==', 'active')
        .where('role', 'in', ['mahasiswa', 'pengunjung'])
        .get();

      const recipients = [];
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        console.log('User data:', { id: doc.id, email: userData.email, name: userData.name, role: userData.role });
        
        if (userData.email && userData.email.includes('@')) {
          recipients.push({
            email: userData.email,
            name: userData.name,
            role: userData.role,
            id: doc.id
          });
        } else {
          console.warn('Invalid email for user:', doc.id, userData.email);
        }
      });

      console.log(`📬 Valid recipients found: ${recipients.length}`);
      console.log('Recipients:', recipients.map(r => ({ email: r.email, name: r.name, role: r.role })));

      if (recipients.length === 0) {
        console.warn('No valid recipients found!');
        return {
          success: false,
          error: 'No valid email recipients found',
          sent: 0,
          failed: 0,
          total: 0
        };
      }

      // Send emails one by one to better track errors
      const results = [];
      let successful = 0;
      let failed = 0;

      for (const recipient of recipients) {
        try {
          const template = emailTemplates.sessionNotification(sessionData, recipient.role);
          const result = await sendEmail(recipient.email, template, sessionData);
          
          if (result.success) {
            successful++;
            console.log(`✅ Email sent to: ${recipient.email} (${recipient.name})`);
          } else {
            failed++;
            console.error(`❌ Failed to send to: ${recipient.email} - ${result.error}`);
          }
          
          results.push({ recipient: recipient.email, success: result.success, error: result.error });
          
          // Add delay between emails to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          failed++;
          console.error(`❌ Error sending to ${recipient.email}:`, error.message);
          results.push({ recipient: recipient.email, success: false, error: error.message });
        }
      }
      
      console.log(`📊 Email results: ${successful} successful, ${failed} failed out of ${recipients.length} total`);
      
      // Save notification log
      await this.saveNotificationLog({
        type: 'session_notification',
        sessionId: sessionData.id,
        recipientCount: recipients.length,
        successCount: successful,
        failCount: failed,
        sentAt: new Date(),
        details: results
      });

      return {
        success: successful > 0,
        sent: successful,
        failed: failed,
        total: recipients.length,
        details: results
      };
    } catch (error) {
      console.error('❌ Error sending session notifications:', error);
      return {
        success: false,
        error: error.message,
        sent: 0,
        failed: 0,
        total: 0
      };
    }
  }

  // Send session reminder
  async sendSessionReminder(sessionData, timeUntil = '1 jam') {
    try {
      console.log('⏰ Sending session reminders...');
      
      // Get all active users
      const usersSnapshot = await db
        .collection('users')
        .where('status', '==', 'active')
        .where('role', 'in', ['mahasiswa', 'pengunjung'])
        .get();

      const recipients = [];
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.email && userData.email.includes('@')) {
          recipients.push({
            email: userData.email,
            name: userData.name,
            role: userData.role
          });
        }
      });

      console.log(`⏰ Sending reminders to ${recipients.length} recipients`);

      if (recipients.length === 0) {
        return { success: false, error: 'No valid recipients', sent: 0, total: 0 };
      }

      // Send reminder emails
      let successful = 0;
      for (const recipient of recipients) {
        try {
          const template = emailTemplates.sessionReminder(sessionData, recipient.role, timeUntil);
          const result = await sendEmail(recipient.email, template, { sessionData, timeUntil });
          
          if (result.success) {
            successful++;
            console.log(`⏰ Reminder sent to: ${recipient.email}`);
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`❌ Error sending reminder to ${recipient.email}:`, error.message);
        }
      }

      return {
        success: successful > 0,
        sent: successful,
        total: recipients.length
      };
    } catch (error) {
      console.error('❌ Error sending reminders:', error);
      return { success: false, error: error.message, sent: 0, total: 0 };
    }
  }

  // Send session update notification
  async sendSessionUpdate(sessionData, updateType) {
    try {
      console.log(`📝 Sending session update: ${updateType}`);
      
      // Get all active users
      const usersSnapshot = await db
        .collection('users')
        .where('status', '==', 'active')
        .where('role', 'in', ['mahasiswa', 'pengunjung'])
        .get();

      const recipients = [];
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        if (userData.email && userData.email.includes('@')) {
          recipients.push({
            email: userData.email,
            name: userData.name,
            role: userData.role
          });
        }
      });

      console.log(`📝 Sending updates to ${recipients.length} recipients`);

      if (recipients.length === 0) {
        return { success: false, error: 'No valid recipients', sent: 0, total: 0 };
      }

      // Send update emails
      let successful = 0;
      for (const recipient of recipients) {
        try {
          const template = emailTemplates.sessionUpdate(sessionData, updateType, recipient.role);
          const result = await sendEmail(recipient.email, template, { sessionData, updateType });
          
          if (result.success) {
            successful++;
            console.log(`📝 Update sent to: ${recipient.email}`);
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`❌ Error sending update to ${recipient.email}:`, error.message);
        }
      }

      return {
        success: successful > 0,
        sent: successful,
        total: recipients.length
      };
    } catch (error) {
      console.error('❌ Error sending updates:', error);
      return { success: false, error: error.message, sent: 0, total: 0 };
    }
  }

  // Send to specific role only
  async sendToRole(sessionData, role, templateType = 'sessionNotification') {
    try {
      console.log(`📧 Sending to ${role} only...`);
      
      const usersSnapshot = await db
        .collection('users')
        .where('status', '==', 'active')
        .where('role', '==', role)
        .get();

      const recipients = [];
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        console.log(`Checking ${role} user:`, { id: doc.id, email: userData.email, name: userData.name });
        
        if (userData.email && userData.email.includes('@')) {
          recipients.push({
            email: userData.email,
            name: userData.name,
            role: userData.role
          });
        }
      });

      console.log(`📧 Found ${recipients.length} valid ${role} recipients`);

      if (recipients.length === 0) {
        return { success: false, error: `No valid ${role} recipients found`, sent: 0, total: 0 };
      }

      // Send emails to specific role
      let successful = 0;
      for (const recipient of recipients) {
        try {
          const template = emailTemplates[templateType](sessionData, recipient.role);
          const result = await sendEmail(recipient.email, template, sessionData);
          
          if (result.success) {
            successful++;
            console.log(`📧 Sent to ${role}: ${recipient.email} (${recipient.name})`);
          } else {
            console.error(`❌ Failed to send to ${role}: ${recipient.email} - ${result.error}`);
          }
          
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`❌ Error sending to ${role} ${recipient.email}:`, error.message);
        }
      }

      console.log(`📧 Sent to ${successful} out of ${recipients.length} ${role} recipients`);

      return {
        success: successful > 0,
        sent: successful,
        total: recipients.length
      };
    } catch (error) {
      console.error(`❌ Error sending to ${role}:`, error);
      return { success: false, error: error.message, sent: 0, total: 0 };
    }
  }

  // Save notification log
  async saveNotificationLog(logData) {
    try {
      await db.collection('notification_logs').add(logData);
      console.log('📝 Notification log saved');
    } catch (error) {
      console.error('Error saving notification log:', error);
    }
  }

  // Get notification history
  async getNotificationHistory(limit = 50) {
    try {
      const logsSnapshot = await db
        .collection('notification_logs')
        .orderBy('sentAt', 'desc')
        .limit(limit)
        .get();

      const logs = [];
      logsSnapshot.forEach(doc => {
        logs.push({ id: doc.id, ...doc.data() });
      });

      return logs;
    } catch (error) {
      console.error('Error getting notification history:', error);
      return [];
    }
  }

  // Schedule reminder emails
  async scheduleReminders(sessionData) {
    try {
      const startDate = new Date(sessionData.startDate);
      const now = new Date();
      
      // Schedule 24h reminder
      const reminder24h = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
      if (reminder24h > now) {
        setTimeout(() => {
          this.sendSessionReminder(sessionData, '24 jam');
        }, reminder24h.getTime() - now.getTime());
        console.log('⏰ 24h reminder scheduled for:', reminder24h);
      }
      
      // Schedule 1h reminder
      const reminder1h = new Date(startDate.getTime() - 60 * 60 * 1000);
      if (reminder1h > now) {
        setTimeout(() => {
          this.sendSessionReminder(sessionData, '1 jam');
        }, reminder1h.getTime() - now.getTime());
        console.log('⏰ 1h reminder scheduled for:', reminder1h);
      }
      
      console.log('⏰ Reminders scheduled for session:', sessionData.title);
    } catch (error) {
      console.error('Error scheduling reminders:', error);
    }
  }

  // Debug function to check users in database
  async debugUsers() {
    try {
      console.log('🔍 Debugging users in database...');
      
      const usersSnapshot = await db.collection('users').get();
      
      console.log(`Total users in database: ${usersSnapshot.size}`);
      
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        console.log('User:', {
          id: doc.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          status: userData.status
        });
      });
      
      // Check specifically for active mahasiswa and pengunjung
      const activeUsersSnapshot = await db
        .collection('users')
        .where('status', '==', 'active')
        .where('role', 'in', ['mahasiswa', 'pengunjung'])
        .get();
      
      console.log(`Active mahasiswa/pengunjung: ${activeUsersSnapshot.size}`);
      
      return {
        total: usersSnapshot.size,
        active: activeUsersSnapshot.size
      };
    } catch (error) {
      console.error('Error debugging users:', error);
      return { total: 0, active: 0 };
    }
  }
}

module.exports = new EmailService();