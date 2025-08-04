const cron = require('node-cron');
const ConnectionRequest = require('../models/connnectionRequest');
const sendEmail = require('../utils/sendEmail');
const { subDays, startOfDay, endOfDay } = require('date-fns');

cron.schedule('0 9 * * *', async () => {
  try{

    const yesterday = subDays(new Date(), 0)
    const yesterdayStart = startOfDay(yesterday)
    const yesterdayEnd = endOfDay(yesterday)

    const getPendingRequests = await ConnectionRequest.find({
        status: 'interested',
        createdAt:{
            $gte: yesterdayStart,
            $lt: yesterdayEnd
        }
    }).populate('fromUserId toUserId')

    const getEmailIds = getPendingRequests.map(item => {
       if(item?.toUserId?.emailId){
        return item?.toUserId?.emailId
       }
    }).filter(Boolean)
    const getUniqueEmailIds = [...new Set(getEmailIds)]
    console.log(getUniqueEmailIds);
    
    for(let emailId of getUniqueEmailIds){
        const sendEmails = await sendEmail.run(`Connections Requests Pending`, `Hii ${emailId}`)
        console.log(sendEmails);
    }

  }catch(err){
    console.log(err)
  }
});