import { ZoomMtg } from '@zoomus/websdk';

console.log('checkSystemRequirements');
console.log(JSON.stringify(ZoomMtg.checkSystemRequirements()));

// it's option if you want to change the WebSDK dependency link resources. setZoomJSLib must be run at first
// if (!china) ZoomMtg.setZoomJSLib('https://source.zoom.us/1.7.8/lib', '/av'); // CDN version default
// else ZoomMtg.setZoomJSLib('https://jssdk.zoomus.cn/1.7.8/lib', '/av'); // china cdn option 
// ZoomMtg.setZoomJSLib('http://localhost:9999/node_modules/@zoomus/websdk/dist/lib', '/av'); // Local version default, Angular Project change to use cdn version
ZoomMtg.preLoadWasm();
ZoomMtg.prepareJssdk();

const API_KEY = 'xxN9CqWi1rYrOqULeXXZgGOU40ZNWVmP0HTi';

/**
    * NEVER PUT YOUR ACTUAL API SECRET IN CLIENT SIDE CODE, THIS IS JUST FOR QUICK PROTOTYPING
    * The below generateSignature should be done server side as not to expose your api secret in public
    * You can find an eaxmple in here: https://marketplace.zoom.us/docs/sdk/native-sdks/Web-Client-SDK/tutorial/generate-signature
    */
const API_SECRET = 'sKoy7nR8xJGymxBOlOirVeWjDbMH1Yvguyc2';

testTool = window.testTool;
document.getElementById('display_name').value = "Local" + ZoomMtg.getJSSDKVersion()[0] + testTool.detectOS() + "#" + testTool.getBrowserInfo();
document.getElementById('meeting_number').value = testTool.getCookie('meeting_number');
document.getElementById('meeting_pwd').value = testTool.getCookie('meeting_pwd');
if (testTool.getCookie('meeting_lang')) document.getElementById('meeting_lang').value = testTool.getCookie('meeting_lang');

document.getElementById('meeting_lang').addEventListener('change', (e) => {
    testTool.setCookie('meeting_lang', document.getElementById('meeting_lang').value);
    $.i18n.reload(document.getElementById('meeting_lang').value);
    ZoomMtg.reRender({lang: document.getElementById('meeting_lang').value});
});

document.getElementById('clear_all').addEventListener('click', (e) => {
    testTool.deleteAllCookies();
    document.getElementById('display_name').value = '';
    document.getElementById('meeting_number').value = '';
    document.getElementById('meeting_pwd').value = '';
    document.getElementById('meeting_lang').value = 'en-US';
    document.getElementById('meeting_role').value = 0;
});
document.getElementById('join_meeting').addEventListener('click', (e) => {
    e.preventDefault();

    const meetConfig = {
        apiKey: API_KEY,
        apiSecret: API_SECRET,
        meetingNumber: parseInt(document.getElementById('meeting_number').value, 10),
        userName: document.getElementById('display_name').value,
        passWord: document.getElementById('meeting_pwd').value,
        leaveUrl: 'https://zoom.us',
        role: parseInt(document.getElementById('meeting_role').value, 10)
    };
    testTool.setCookie('meeting_number', meetConfig.meetingNumber);
    testTool.setCookie('meeting_pwd', meetConfig.passWord);
    console.log(meetConfig);

    ZoomMtg.generateSignature({
        meetingNumber: meetConfig.meetingNumber,
        apiKey: meetConfig.apiKey,
        apiSecret: meetConfig.apiSecret,
        role: meetConfig.role,
        success(res) {
            console.log('signature', res.result);
            ZoomMtg.init({
                leaveUrl: 'http://www.zoom.us',
                success() {
                    ZoomMtg.join(
                        {
                            meetingNumber: meetConfig.meetingNumber,
                            userName: meetConfig.userName,
                            signature: res.result,
                            apiKey: meetConfig.apiKey,
                            passWord: meetConfig.passWord,
                            success() {
                                $('#nav-tool').hide();
                                console.log('join meeting success');
                            },
                            error(res) {
                                console.log(res);
                            }
                        }
                    );
                },
                error(res) {
                    console.log(res);
                }
            });
        }
    });
});
