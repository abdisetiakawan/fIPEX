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
        if (userData.email) {
          recipients.push({
            email: userData.email,
            name: userData.name,
            role: userData.role,
            id: doc.id
          });
        }
      });

      console.log(`📬 Sending to ${recipients.length} recipients`);

      // Create email template
      const template = emailTemplates.sessionNotification(sessionData, 'general');
      
      // Send bulk emails
      const results = await sendBulkEmail(recipients, template, sessionData);
      
      // Log results
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      console.log(`✅ Email notifications sent: ${successful} successful, ${failed} failed`);
      
      // Save notification log
      await this.saveNotificationLog({
        type: 'session_notification',
        sessionId: sessionData.id,
        recipientCount: recipients.length,
        successCount: successful,
        failCount: failed,
        sentAt: new Date()
      });

      return {
        success: true,
        sent: successful,
        failed: failed,
        total: recipients.length
      };
    } catch (error) {
      console.error('❌ Error sending session notifications:', error);
      return {
        success: false,
        error: error.message
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
        if (userData.email) {
          recipients.push({
            email: userData.email,
            name: userData.name,
            role: userData.role
          });
        }
      });

      // Create reminder template
      const template = emailTemplates.sessionReminder(sessionData, 'general', timeUntil);
      
      // Send bulk emails
      const results = await sendBulkEmail(recipients, template, { sessionData, timeUntil });
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      console.log(`⏰ Reminder sent to ${successful} recipients`);

      return {
        success: true,
        sent: successful,
        total: recipients.length
      };
    } catch (error) {
      console.error('❌ Error sending reminders:', error);
      return { success: false, error: error.message };
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
        if (userData.email) {
          recipients.push({
            email: userData.email,
            name: userData.name,
            role: userData.role
          });
        }
      });

      // Create update template
      const template = emailTemplates.sessionUpdate(sessionData, updateType, 'general');
      
      // Send bulk emails
      const results = await sendBulkEmail(recipients, template, { sessionData, updateType });
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      console.log(`📝 Update sent to ${successful} recipients`);

      return {
        success: true,
        sent: successful,
        total: recipients.length
      };
    } catch (error) {
      console.error('❌ Error sending updates:', error);
      return { success: false, error: error.message };
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
        if (userData.email) {
          recipients.push({
            email: userData.email,
            name: userData.name,
            role: userData.role
          });
        }
      });

      const template = emailTemplates[templateType](sessionData, role);
      const results = await sendBulkEmail(recipients, template, sessionData);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      console.log(`📧 Sent to ${successful} ${role} recipients`);

      return {
        success: true,
        sent: successful,
        total: recipients.length
      };
    } catch (error) {
      console.error(`❌ Error sending to ${role}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Save notification log
  async saveNotificationLog(logData) {
    try {
      await db.collection('notification_logs').add(logData);
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
      }
      
      // Schedule 1h reminder
      const reminder1h = new Date(startDate.getTime() - 60 * 60 * 1000);
      if (reminder1h > now) {
        setTimeout(() => {
          this.sendSessionReminder(sessionData, '1 jam');
        }, reminder1h.getTime() - now.getTime());
      }
      
      console.log('⏰ Reminders scheduled for session:', sessionData.title);
    } catch (error) {
      console.error('Error scheduling reminders:', error);
    }
  }
}

module.exports = new EmailService();