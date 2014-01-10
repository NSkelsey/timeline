from flask import Flask, render_template, request, session, make_response, abort
from apiclient.errors import Error
import json, md5, random, httplib2

from apiclient.discovery import build
from apiclient.http import MediaFileUpload
from oauth2client.client import OAuth2WebServerFlow, flow_from_clientsecrets

app = Flask(__name__, static_url_path='/static')
app.secret_key = "this is not so secret :-)"
CLIENT_ID = "199288599201-b215dp4cqooidbbvi4emu07t5hl5dcf9.apps.googleusercontent.com"

secrets = json.loads(open('client_secrets.json').read())['web']
# Copy your credentials from the console
CLIENT_ID = secrets['client_id']
CLIENT_SECRET = secrets['client_secret']
OAUTH_SCOPE = 'https://www.googleapis.com/auth/drive'
REDIRECT_URI = ''


#:@app.route("/")
def main():
    return render_template("index.html")

@app.route("/data")
def data(): # Just returns local data for now
    fname = "example.json"
    json = open(fname).read()
    return json

@app.route("/")
def test_this():
    state = str(random.random())
    session['STATE'] = str(state)
    session['CLIENT_ID'] = CLIENT_ID
    session['APPLICATION_NAME'] = "fluid-griffin-455"
    resp = make_response(render_template("test.html"))
    resp.set_cookie('CLIENT_ID', CLIENT_ID)
    resp.set_cookie('STATE', str(state))
    resp.set_cookie('APPLICATION_NAME', "fluid-griffin-455")
    return resp


@app.route("/oauth2callback", methods=["POST"])
def recieve_code():
    code = request.data
    if code == '':
        abort(412)
    else:
        print session['STATE']
        print request.cookies.get('STATE', '') 
        if session['STATE'] != request.cookies.get('STATE', ''):
            abort(401, "bad state parameter")

        try:
            # Upgrade the authorization code into a credentials object
            oauth_flow = flow_from_clientsecrets('client_secrets.json', scope='https://www.googleapis.com/auth/drive')
            oauth_flow.redirect_uri = 'postmessage'
            credentials = oauth_flow.step2_exchange(code)
        except Error as e:
            abort(500, e)
            
        # Check that the access token is valid.
        access_token = credentials.access_token
        url = ('https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=%s'
             % access_token)
        h = httplib2.Http()
        result = json.loads(h.request(url, 'GET')[1])
        print result
         # Create an httplib2.Http object and authorize it with our credentials
        http = httplib2.Http()
        http = credentials.authorize(http)
        drive_service = build('drive', 'v2', http=http)
        return "derpderpderp"
        

if __name__ == "__main__":
    app.run(debug=True)

