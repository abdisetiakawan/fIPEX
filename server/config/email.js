const nodemailer = require('nodemailer');

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  }
};

// Create transporter
const transporter = nodemailer.createTransporter(emailConfig);

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// Email templates
const emailTemplates = {
  sessionNotification: (sessionData, userRole) => ({
    subject: `📅 Jadwal Baru: ${sessionData.title} - Digital Exhibition`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .session-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .highlight { background: #FEF3C7; padding: 2px 6px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎨 Digital Exhibition</h1>
            <p>Pemberitahuan Jadwal Sesi Baru</p>
          </div>
          
          <div class="content">
            <h2>Halo ${userRole === 'mahasiswa' ? 'Mahasiswa' : 'Pengunjung'}! 👋</h2>
            
            <p>Kami ingin memberitahukan bahwa ada <strong>jadwal sesi baru</strong> yang telah dibuat untuk Digital Exhibition:</p>
            
            <div class="session-info">
              <h3>📋 ${sessionData.title}</h3>
              <p><strong>Deskripsi:</strong> ${sessionData.description}</p>
              <p><strong>Tipe Sesi:</strong> <span class="highlight">${getSessionTypeText(sessionData.type)}</span></p>
              <p><strong>📅 Mulai:</strong> ${formatDateTime(sessionData.startDate)}</p>
              <p><strong>⏰ Berakhir:</strong> ${formatDateTime(sessionData.endDate)}</p>
              <p><strong>⏱️ Durasi:</strong> ${calculateDuration(sessionData.startDate, sessionData.endDate)}</p>
            </div>
            
            ${getSessionSpecificContent(sessionData.type, userRole)}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" class="button">
                🚀 Akses Digital Exhibition
              </a>
            </div>
            
            <div style="background: #E5F3FF; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p><strong>💡 Tips:</strong></p>
              <ul>
                <li>Simpan jadwal ini di kalender Anda</li>
                <li>Pastikan koneksi internet stabil saat sesi berlangsung</li>
                <li>Login 15 menit sebelum sesi dimulai</li>
                ${userRole === 'pengunjung' ? '<li>Siapkan diri untuk memberikan vote pada karya favorit Anda</li>' : ''}
                ${userRole === 'mahasiswa' ? '<li>Pastikan karya Anda sudah disubmit sebelum deadline</li>' : ''}
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>Email ini dikirim secara otomatis oleh sistem Digital Exhibition</p>
            <p>Jika ada pertanyaan, silakan hubungi panitia</p>
            <p style="margin-top: 20px; font-size: 12px; color: #999;">
              © 2024 Digital Exhibition. All rights reserved.
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  sessionReminder: (sessionData, userRole, timeUntil) => ({
    subject: `⏰ Reminder: ${sessionData.title} dimulai ${timeUntil}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #F59E0B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .urgent { background: #FEF2F2; border: 2px solid #F87171; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { display: inline-block; background: #F59E0B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Reminder Sesi</h1>
            <p>Digital Exhibition</p>
          </div>
          
          <div class="content">
            <div class="urgent">
              <h2>🚨 Sesi akan dimulai ${timeUntil}!</h2>
              <h3>${sessionData.title}</h3>
              <p><strong>Waktu:</strong> ${formatDateTime(sessionData.startDate)}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" class="button">
                🚀 Join Sekarang
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  sessionUpdate: (sessionData, updateType, userRole) => ({
    subject: `📝 Update Sesi: ${sessionData.title} - ${updateType}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8B5CF6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
          .update-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8B5CF6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 Update Sesi</h1>
            <p>Digital Exhibition</p>
          </div>
          
          <div class="content">
            <h2>Update: ${updateType}</h2>
            
            <div class="update-info">
              <h3>${sessionData.title}</h3>
              <p>${sessionData.description}</p>
              <p><strong>Status:</strong> ${updateType}</p>
              <p><strong>Waktu:</strong> ${formatDateTime(sessionData.startDate)}</p>
            </div>
            
            ${getUpdateSpecificContent(updateType, userRole)}
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Helper functions for email templates
function getSessionTypeText(type) {
  const types = {
    'voting': '🗳️ Periode Voting',
    'exhibition': '🎨 Periode Pameran',
    'review': '📝 Periode Review',
    'announcement': '📢 Pengumuman'
  };
  return types[type] || type;
}

function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta'
  });
}

function calculateDuration(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end - start;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (diffDays > 0) {
    return `${diffDays} hari ${diffHours} jam`;
  }
  return `${diffHours} jam`;
}

function getSessionSpecificContent(type, userRole) {
  const content = {
    'voting': {
      'mahasiswa': `
        <div style="background: #E0F2FE; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4>📊 Untuk Mahasiswa:</h4>
          <p>Selama periode voting, Anda dapat:</p>
          <ul>
            <li>Melihat progress voting karya Anda</li>
            <li>Memantau ranking dan statistik</li>
            <li>Melihat komentar dari pengunjung</li>
          </ul>
          <p><strong>Catatan:</strong> Mahasiswa tidak dapat memberikan vote</p>
        </div>
      `,
      'pengunjung': `
        <div style="background: #F0FDF4; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4>🗳️ Untuk Pengunjung:</h4>
          <p>Selama periode voting, Anda dapat:</p>
          <ul>
            <li>Memberikan vote pada karya favorit</li>
            <li>Memberikan komentar dan feedback</li>
            <li>Menyimpan karya ke favorit</li>
            <li>Menjelajahi semua kategori karya</li>
          </ul>
          <p><strong>Jangan lupa:</strong> Setiap pengunjung hanya dapat vote 1x per karya</p>
        </div>
      `
    },
    'exhibition': {
      'mahasiswa': `
        <div style="background: #FEF3C7; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4>🎨 Periode Pameran:</h4>
          <p>Karya Anda akan dipamerkan dan dapat dilihat oleh semua pengunjung</p>
        </div>
      `,
      'pengunjung': `
        <div style="background: #FEF3C7; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4>🎨 Periode Pameran:</h4>
          <p>Jelajahi semua karya mahasiswa dan berikan apresiasi Anda</p>
        </div>
      `
    },
    'review': {
      'mahasiswa': `
        <div style="background: #F3E8FF; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4>📝 Periode Review:</h4>
          <p>Karya Anda sedang dalam proses review oleh panitia</p>
        </div>
      `,
      'pengunjung': `
        <div style="background: #F3E8FF; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4>📝 Periode Review:</h4>
          <p>Panitia sedang melakukan review karya-karya yang disubmit</p>
        </div>
      `
    },
    'announcement': {
      'mahasiswa': `
        <div style="background: #FEE2E2; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4>📢 Pengumuman Penting:</h4>
          <p>Pastikan Anda tidak melewatkan pengumuman penting ini</p>
        </div>
      `,
      'pengunjung': `
        <div style="background: #FEE2E2; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <h4>📢 Pengumuman Penting:</h4>
          <p>Informasi penting terkait Digital Exhibition</p>
        </div>
      `
    }
  };
  
  return content[type]?.[userRole] || '';
}

function getUpdateSpecificContent(updateType, userRole) {
  const updates = {
    'Started': 'Sesi telah dimulai! Silakan bergabung sekarang.',
    'Paused': 'Sesi telah dijeda sementara. Mohon tunggu informasi selanjutnya.',
    'Ended': 'Sesi telah berakhir. Terima kasih atas partisipasi Anda.',
    'Cancelled': 'Sesi telah dibatalkan. Mohon maaf atas ketidaknyamanannya.'
  };
  
  return `<p><strong>${updates[updateType] || updateType}</strong></p>`;
}

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    console.log('📧 Attempting to send email to:', to);
    console.log('📧 Template subject:', template.subject);
    
    const mailOptions = {
      from: `"Digital Exhibition" <${process.env.SMTP_USER}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: template.subject,
      html: template.html
    };

    console.log('📧 Mail options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Bulk email function
const sendBulkEmail = async (recipients, template, data) => {
  const results = [];
  const batchSize = 10; // Send in batches to avoid rate limiting
  
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    const batchPromises = batch.map(recipient => 
      sendEmail(recipient.email, template, { ...data, userRole: recipient.role })
    );
    
    try {
      const batchResults = await Promise.allSettled(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error('Batch email error:', error);
    }
  }
  
  return results;
};

module.exports = {
  transporter,
  emailTemplates,
  sendEmail,
  sendBulkEmail,
  formatDateTime,
  getSessionTypeText
};