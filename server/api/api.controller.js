'use strict';
const config = require(__base + 'modules/t1t-config');
const gcloud = require('google-cloud');
const request = require('request');
const rp = require('request-promise-native');
const _ = require('lodash');
const q = require('q');

let datastore  = gcloud.datastore({
    projectId: config.gcloud.project,
    keyFilename: __base + config.gcloud.keyfile
});

module.exports = {
    convertJP2toJPEG: convertJP2toJPEG,
    processDownload: processDownload,
    processUnknownCard: processUnknownCard
};


function convertJP2toJPEG(req, res) {
    const file = req.file;


    let options = {
        url: "https://api2.online-convert.com/jobs",
        headers: {
            "x-oc-api-key": "4f1e5e127dad7b6dd6077ccdc9edf092",
        },
        json: true,
        body: {
            conversion: [ { category: 'image', target: 'png' } ]
        }
    };

    request.post(options, function (err, resp, body) {
        let uploadOptions = {
            url: body.server + '/upload-file/' + body.id,
            headers: {
                'x-oc-token': body.token
            },
            formData: {
                file: {
                    value:  file.buffer,
                    options: {
                        filename: file.originalname,
                        contentType: file.mimetype
                    }
                },
            }
        };
        request.post(uploadOptions, function (err, response, body) {
            let parsedBody = JSON.parse(body);
            let statusOptions = {
                url: 'https://api2.online-convert.com/jobs/' + parsedBody.id.job,
                headers: {
                    "x-oc-api-key": "4f1e5e127dad7b6dd6077ccdc9edf092",
                }
            };
            checkCompletion(statusOptions).then(function (body) {
                let getOptions = {
                    url: body.output[0].uri
                };
                return rp.get(getOptions).pipe(res);
            });
        });
    });

    function checkCompletion(options) {
        return rp.get(options).then(function (body) {
            let parsedBody = JSON.parse(body);
            if (parsedBody.status.code != 'completed') return checkCompletion(options);
            else return parsedBody;
        });
    }
}

function processDownload(req, res) {
    /// Sanity checks
    let email = _.find(req.body, function (o, key) {
        return key === 'email';
    });
    if (!email) return res.status(400).json({ success: false, data: 'Missing email parameter' });

    let dlUrl = _.find(req.body, function (o, key) {
        return key === 'dlUrl';
    });
    if (!dlUrl) return res.status(400).json({ success: false, data: 'Missing download link parameter' });

    let platformName = _.find(req.body, function (o, key) {
        return key === 'platformName';
    });
    if (!platformName) return res.status(400).json({ success: false, data: 'Missing platform name parameter'});

    let type = _.find(req.body, function (o, key) {
        return key === 'type';
    });
    if (!type) return res.status(400).json({ success: false, data: 'Missing type identifier' });

    let payload = _.find(req.body, function (o, key) {
        return key === 'payload';
    });
    if (!payload) return res.status(400).json({ success: false, data: 'Missing payload data' });


    // Send mail via mailgun
    let mailData = {
        from: config.mailgun.sender,
        to: email,
        subject: 'Download instructions for Trust1Connector',
        html: createHtmlEmail(dlUrl, platformName)
    };
    // fire request
    let url = config.mailgun.scheme + '://' + config.mailgun.user + ':' + config.mailgun.apikey + '@' + config.mailgun.url;
    request.post({ url: url, formData: mailData }, function cb(err, httpResponse, body) {
        if (err) {
            return res.status(500).json({ success: false, data: err.message });
        }

        let typeKey = datastore.key(type);

        let dataArray = _.concat([{ name: 'created', value: new Date() }, { name: 'email', value: email }], payload);

        // Store object in GC datastore
        saveToDatastore(typeKey, dataArray, function (err) {
            if (err) {
                return res.status(500).json({ success: false, data: err.message });
            }
            let id = typeKey.path.pop();
            return res.json({ success: true, data: id });
        });
    });
}

function processUnknownCard(req, res) {
    /// Sanity checks
    let atr = _.find(req.body, function (o, key) {
        return key === 'atr';
    });
    if (!atr) return res.status(400).json({ success: false, data: 'Missing atr parameter' });

    let type = _.find(req.body, function (o, key) {
        return key === 'type';
    });
    if (!type) return res.status(400).json({ success: false, data: 'Missing type identifier' });

    let payload = _.find(req.body, function (o, key) {
        return key === 'payload';
    });
    if (!payload) return res.status(400).json({ success: false, data: 'Missing payload' });


    let typeKey = datastore.key(type);
    let dataArray = _.concat([{ name: 'created', value: new Date() }, { name: 'atr', value: atr }], payload);

    // Store object in GC datastore
    saveToDatastore(typeKey, dataArray, function (err) {
        if (err) {
            return res.status(500).json({ success: false, data: err.message });
        }
        let id = typeKey.path.pop();
        return res.json({ success: true, data: id });
    });
}

// Utility functions
function saveToDatastore(typeKey, data, cb) {
    return datastore.save({
        key: typeKey,
        data: data
    }, cb);
}

function createHtmlEmail(link, platform) {
    return '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><html xmlns="http://www.w3.org/1999/xhtml"><head> <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/> <title>ReadMyCards Connector Download</title> <style type="text/css">/* /\/\/\/\/\/\/\/\/ CLIENT-SPECIFIC STYLES /\/\/\/\/\/\/\/\/ */#outlook a{padding:0;}/* Force Outlook to provide a "view in browser" message */.ReadMsgBody{width:100%;}.ExternalClass{width:100%;}/* Force Hotmail to display emails at full width */.ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div{line-height: 100%;}/* Force Hotmail to display normal line spacing */body, table, td, p, a, li, blockquote{-webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;}/* Prevent WebKit and Windows mobile changing default text sizes */table, td{mso-table-lspace:0pt; mso-table-rspace:0pt;}/* Remove spacing between tables in Outlook 2007 and up */img{-ms-interpolation-mode:bicubic;}/* Allow smoother rendering of resized image in Internet Explorer *//* /\/\/\/\/\/\/\/\/ RESET STYLES /\/\/\/\/\/\/\/\/ */body{margin:0; padding:0;}img{border:0; height:auto; line-height:100%; outline:none; text-decoration:none;}table{border-collapse:collapse !important;}body, #bodyTable, #bodyCell{height:100% !important; margin:0; padding:0; width:100% !important;}/* /\/\/\/\/\/\/\/\/ TEMPLATE STYLES /\/\/\/\/\/\/\/\/ *//*==========Page Styles==========*/#bodyCell{padding:20px;}#templateContainer{width:600px;}/*** @tab Page* @section background style* @tip Set the background color and top border for your email. You may want to choose colors that match your company\'s branding.* @theme page*/body, #bodyTable{/*@editable*/ background-color:#CFCFCF;}/*** @tab Page* @section background style* @tip Set the background color and top border for your email. You may want to choose colors that match your company\'s branding.* @theme page*/#bodyCell{}/*** @tab Page* @section email border* @tip Set the border for your email.*/#templateContainer{/*@editable*/ border:1px solid #BBBBBB;}/*** @tab Page* @section heading 1* @tip Set the styling for all first-level headings in your emails. These should be the largest of your headings.* @style heading 1*/h1{/*@editable*/ color:#202020 !important;display:block;/*@editable*/ font-family:Helvetica;/*@editable*/ font-size:26px;/*@editable*/ font-style:normal;/*@editable*/ font-weight:bold;/*@editable*/ line-height:100%;/*@editable*/ letter-spacing:normal;margin-top:0;margin-right:0;margin-bottom:10px;margin-left:0;/*@editable*/ text-align:left;}/*** @tab Page* @section heading 2* @tip Set the styling for all second-level headings in your emails.* @style heading 2*/h2{/*@editable*/ color:#404040 !important;display:block;/*@editable*/ font-family:Helvetica;/*@editable*/ font-size:20px;/*@editable*/ font-style:normal;/*@editable*/ font-weight:bold;/*@editable*/ line-height:100%;/*@editable*/ letter-spacing:normal;margin-top:0;margin-right:0;margin-bottom:10px;margin-left:0;/*@editable*/ text-align:left;}/*** @tab Page* @section heading 3* @tip Set the styling for all third-level headings in your emails.* @style heading 3*/h3{/*@editable*/ color:#606060 !important;display:block;/*@editable*/ font-family:Helvetica;/*@editable*/ font-size:16px;/*@editable*/ font-style:italic;/*@editable*/ font-weight:normal;/*@editable*/ line-height:100%;/*@editable*/ letter-spacing:normal;margin-top:0;margin-right:0;margin-bottom:10px;margin-left:0;/*@editable*/ text-align:left;}/*** @tab Page* @section heading 4* @tip Set the styling for all fourth-level headings in your emails. These should be the smallest of your headings.* @style heading 4*/h4{/*@editable*/ color:#808080 !important;display:block;/*@editable*/ font-family:Helvetica;/*@editable*/ font-size:14px;/*@editable*/ font-style:italic;/*@editable*/ font-weight:normal;/*@editable*/ line-height:100%;/*@editable*/ letter-spacing:normal;margin-top:0;margin-right:0;margin-bottom:10px;margin-left:0;/*@editable*/ text-align:left;}/*==========Header Styles==========*//*** @tab Header* @section preheader style* @tip Set the background color and bottom border for your email\'s preheader area.* @theme header*/#templatePreheader{/*@editable*/ background-color:#F4F4F4;/*@editable*/ border-bottom:1px solid #CCCCCC;}/*** @tab Header* @section preheader text* @tip Set the styling for your email\'s preheader text. Choose a size and color that is easy to read.*/.preheaderContent{/*@editable*/ color:#808080;/*@editable*/ font-family:Helvetica;/*@editable*/ font-size:10px;/*@editable*/ line-height:125%;/*@editable*/ text-align:left;}/*** @tab Header* @section preheader link* @tip Set the styling for your email\'s preheader links. Choose a color that helps them stand out from your text.*/.preheaderContent a:link, .preheaderContent a:visited, /* Yahoo! Mail Override */ .preheaderContent a .yshortcuts /* Yahoo! Mail Override */{/*@editable*/ color:#606060;/*@editable*/ font-weight:normal;/*@editable*/ text-decoration:underline;}/*** @tab Header* @section header style* @tip Set the background color and borders for your email\'s header area.* @theme header*/#templateHeader{/*@editable*/ background-color:#F4F4F4;/*@editable*/ border-top:1px solid #FFFFFF;/*@editable*/ border-bottom:1px solid #CCCCCC;}/*** @tab Header* @section header text* @tip Set the styling for your email\'s header text. Choose a size and color that is easy to read.*/.headerContent{/*@editable*/ color:#505050;/*@editable*/ font-family:Helvetica;/*@editable*/ font-size:20px;/*@editable*/ font-weight:bold;/*@editable*/ line-height:100%;/*@editable*/ padding-top:0;/*@editable*/ padding-right:0;/*@editable*/ padding-bottom:0;/*@editable*/ padding-left:0;/*@editable*/ text-align:left;/*@editable*/ vertical-align:middle;}/*** @tab Header* @section header link* @tip Set the styling for your email\'s header links. Choose a color that helps them stand out from your text.*/.headerContent a:link, .headerContent a:visited, /* Yahoo! Mail Override */ .headerContent a .yshortcuts /* Yahoo! Mail Override */{/*@editable*/ color:#82aa1b;/*@editable*/ font-weight:normal;/*@editable*/ text-decoration:underline;}#headerImage{height:auto;max-width:600px;}/*==========Body Styles==========*//*** @tab Body* @section body style* @tip Set the background color and borders for your email\'s body area.*/#templateBody{/*@editable*/ background-color:#F4F4F4;/*@editable*/ border-top:1px solid #FFFFFF;/*@editable*/ border-bottom:1px solid #CCCCCC;}/*** @tab Body* @section body text* @tip Set the styling for your email\'s main content text. Choose a size and color that is easy to read.* @theme main*/.bodyContent{/*@editable*/ color:#505050;/*@editable*/ font-family:Helvetica;/*@editable*/ font-size:14px;/*@editable*/ line-height:150%;padding-top:20px;padding-right:20px;padding-bottom:20px;padding-left:20px;/*@editable*/ text-align:left;}/*** @tab Body* @section body link* @tip Set the styling for your email\'s main content links. Choose a color that helps them stand out from your text.*/.bodyContent a:link, .bodyContent a:visited, /* Yahoo! Mail Override */ .bodyContent a .yshortcuts /* Yahoo! Mail Override */{/*@editable*/ color:#82aa1b;/*@editable*/ font-weight:normal;/*@editable*/ text-decoration:underline;}.bodyContent img{display:inline;height:auto;max-width:560px;}/*==========Footer Styles==========*//*** @tab Footer* @section footer style* @tip Set the background color and borders for your email\'s footer area.* @theme footer*/#templateFooter{/*@editable*/ background-color:#F4F4F4;/*@editable*/ border-top:1px solid #FFFFFF;}/*** @tab Footer* @section footer text* @tip Set the styling for your email\'s footer text. Choose a size and color that is easy to read.* @theme footer*/.footerContent{/*@editable*/ color:#808080;/*@editable*/ font-family:Helvetica;/*@editable*/ font-size:10px;/*@editable*/ line-height:150%;padding-top:20px;padding-right:20px;padding-bottom:20px;padding-left:20px;/*@editable*/ text-align:left;}/*** @tab Footer* @section footer link* @tip Set the styling for your email\'s footer links. Choose a color that helps them stand out from your text.*/.footerContent a:link, .footerContent a:visited, /* Yahoo! Mail Override */ .footerContent a .yshortcuts, .footerContent a span /* Yahoo! Mail Override */{/*@editable*/ color:#606060;/*@editable*/ font-weight:normal;/*@editable*/ text-decoration:underline;}/* /\/\/\/\/\/\/\/\/ MOBILE STYLES /\/\/\/\/\/\/\/\/ */ @media only screen and (max-width: 480px){/* /\/\/\/\/\/\/ CLIENT-SPECIFIC MOBILE STYLES /\/\/\/\/\/\/ */body, table, td, p, a, li, blockquote{-webkit-text-size-adjust:none !important;}/* Prevent Webkit platforms from changing default text sizes */ body{width:100% !important; min-width:100% !important;}/* Prevent iOS Mail from adding padding to the body *//* /\/\/\/\/\/\/ MOBILE RESET STYLES /\/\/\/\/\/\/ */#bodyCell{padding:10px !important;}/* /\/\/\/\/\/\/ MOBILE TEMPLATE STYLES /\/\/\/\/\/\/ *//*========Page Styles========*//*** @tab Mobile Styles* @section template width* @tip Make the template fluid for portrait or landscape view adaptability. If a fluid layout doesn\'t work for you, set the width to 300px instead.*/#templateContainer{max-width:600px !important;/*@editable*/ width:100% !important;}/*** @tab Mobile Styles* @section heading 1* @tip Make the first-level headings larger in size for better readability on small screens.*/h1{/*@editable*/ font-size:24px !important;/*@editable*/ line-height:100% !important;}/*** @tab Mobile Styles* @section heading 2* @tip Make the second-level headings larger in size for better readability on small screens.*/h2{/*@editable*/ font-size:20px !important;/*@editable*/ line-height:100% !important;}/*** @tab Mobile Styles* @section heading 3* @tip Make the third-level headings larger in size for better readability on small screens.*/h3{/*@editable*/ font-size:18px !important;/*@editable*/ line-height:100% !important;}/*** @tab Mobile Styles* @section heading 4* @tip Make the fourth-level headings larger in size for better readability on small screens.*/h4{/*@editable*/ font-size:16px !important;/*@editable*/ line-height:100% !important;}#templatePreheader{display:none !important;}#headerImage{height:auto !important;max-width:600px !important;width:100% !important;}.headerContent{font-size:20px !important;line-height:125% !important;}.bodyContent{font-size:18px !important;line-height:125% !important;}.footerContent{font-size:14px !important;line-height:115% !important;}.footerContent a{display:block !important;}}</style> </head> <body leftmargin="0" marginwidth="0" topmargin="0" marginheight="0" offset="0"> <center> <table align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable"> <tr> <td align="center" valign="top" id="bodyCell"> <table border="0" cellpadding="0" cellspacing="0" id="templateContainer"> <tr> <td align="center" valign="top"> <table border="0" cellpadding="0" cellspacing="0" width="100%" id="templatePreheader"> <tr> <td valign="top" class="preheaderContent" style="padding-top:10px; padding-right:20px; padding-bottom:10px; padding-left:20px;" mc:edit="preheader_content00"> Your Trust1Connector download is ready! </td><td valign="top" width="180" class="preheaderContent" style="padding-top:10px; padding-right:20px; padding-bottom:10px; padding-left:0;" mc:edit="preheader_content01"> Email not displaying correctly?<br/><a href="*|ARCHIVE|*" target="_blank">View it in your browser</a>. </td></tr></table> </td></tr><tr> <td align="center" valign="top"> <table border="0" cellpadding="0" cellspacing="0" width="100%" id="templateBody"> <tr> <td valign="top" class="bodyContent" mc:edit="body_content"> <h1>Hello!</h1> You (or someone using your email address) has requested to download Trust1Connector, the software component that is required for using <a href="http://www.readmycards.eur">ReadMyCards.eu</a>. <br/> <br/> Click the link below to start your download. <br/> <br/> <a href="' + link + '"><h2>Download Trust1Connector (' + platform + ')</h2></a> <br/>Once the download is completed, just run the downloaded file to install the component. The install wizard will run you through the process.<br /> <br /> If you did not request a download, you can safely ignore this email. <br/> <br/> Best regards, <br/> The ReadMyCards team </td></tr></table> </td></tr><tr> <td align="center" valign="top"> <table border="0" cellpadding="0" cellspacing="0" width="100%" id="templateFooter"> <tr style="padding-top: 0;"> <td valign="top" class="footerContent" style="padding-top:10px;padding-bottom:0px;" mc:edit="footer_content01"> <em>Copyright &copy; 2016 Trust1Team, All rights reserved.</em> </td></tr><tr> <td valign="top" class="footerContent" style="padding-top:5px; padding-bottom:10px;" mc:edit="footer_content00"> <a href="http://www.readmycards.eu">ReadMyCards</a>&nbsp;&nbsp;&nbsp;<a href="http://www.trust1connector.com">Trust1Connector</a>&nbsp;&nbsp;&nbsp;<a href="http://www.trust1team.com">Trust1Team</a>&nbsp; </td></tr></table> </td></tr></table> </td></tr></table> </center> </body></html>';
}