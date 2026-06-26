// plugins/autoForward.js
const { bot } = require('../lib/');

// ============================================
// CONFIGURATION - Edit these values
// ============================================

// List of source groups to monitor for images
const SOURCE_GROUPS = [
    '120363428389082831@g.us',  // Group 1 - Source
    '120363424960811886@g.us'   // Group 2 - Source
];

// Target group where images will be forwarded
const TARGET_GROUP = '120363424960811886@g.us';

// ============================================
// IMAGE DETECTION & FORWARDING LOGIC
// ============================================

// Listen for ALL messages (not just commands)
bot(
    {
        on: 'message',           // Triggers on every incoming message
        dontAddCommandList: true // Hide this from !help command
    },
    async (message, match, ctx) => {
        try {
            // --------------------------------------------
            // STEP 1: Check if message is from a source group
            // --------------------------------------------
            // message.from contains the sender ID
            // Group IDs end with '@g.us', personal IDs end with '@s.whatsapp.net'
            // We compare against our list of source groups
            if (!SOURCE_GROUPS.includes(message.from)) {
                // Not a source group - ignore this message
                return;
            }
            console.log(`📨 Message received from source group: ${message.from}`);

            // --------------------------------------------
            // STEP 2: Check if message contains media
            // --------------------------------------------
            // hasMedia is a boolean property from whatsapp-web.js
            // Returns true if message has any attachment (image, video, document, etc.)
            if (!message.hasMedia) {
                console.log('⏭️ No media in this message, skipping...');
                return;
            }
            console.log('📎 Media detected in message');

            // --------------------------------------------
            // STEP 3: Download the media
            // --------------------------------------------
            // downloadMedia() downloads the media file from WhatsApp servers
            // Returns an object with: data (base64), mimetype, filename, filesize
            const media = await message.downloadMedia();
            
            if (!media) {
                console.log('⚠️ Failed to download media');
                return;
            }
            console.log(`📥 Downloaded media (size: ${media.filesize || 'unknown'} bytes)`);

            // --------------------------------------------
            // STEP 4: Check if it's an IMAGE
            // --------------------------------------------
            // media.mimetype contains the MIME type of the file
            // Image MIME types start with 'image/'
            // Common examples: image/jpeg, image/png, image/webp, image/gif
            // 
            // !!! THIS IS THE KEY IMAGE DETECTION LINE !!!
            if (!media.mimetype || !media.mimetype.startsWith('image/')) {
                console.log(`⏭️ Not an image (mimetype: ${media.mimetype}), skipping...`);
                return;
            }
            console.log(`🖼️ IMAGE DETECTED! Type: ${media.mimetype}`);

            // --------------------------------------------
            // STEP 5: Forward image to target group
            // --------------------------------------------
            // sendMessage() sends the media to the target group
            // We include a caption with the forwarding details
            await ctx.client.sendMessage(TARGET_GROUP, media, {
                caption: `📸 **Auto-Forwarded Image**\n` +
                        `━━━━━━━━━━━━━━━━━\n` +
                        `📤 From: ${message.from.replace('@g.us', '')}\n` +
                        `🕐 Time: ${new Date().toLocaleString()}\n` +
                        `📎 Type: ${media.mimetype}`
            });

            // --------------------------------------------
            // STEP 6: Log success for debugging
            // --------------------------------------------
            console.log(`✅ SUCCESS: Image forwarded from ${message.from} to ${TARGET_GROUP}`);
            console.log(`   ├─ MIME Type: ${media.mimetype}`);
            console.log(`   └─ File size: ${media.filesize || 'unknown'} bytes`);

        } catch (error) {
            // --------------------------------------------
            // ERROR HANDLING - Catch any failures
            // --------------------------------------------
            console.error('❌ Auto-forward error:', {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
        }
    }
);