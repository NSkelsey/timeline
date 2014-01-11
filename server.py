from flask import Flask, render_template
import requests

app = Flask(__name__, static_url_path='/static')

@app.route("/")
def main():
    return render_template("index.html")

@app.route("/<chart>")
def charts(chart):
    return render_template(chart)

@app.route("/data")
def data(): # Just returns local data for now
    url = "https://spreadsheets.google.com/a/google.com/tq?key=0AqeLZN-5NKsPdGlpcnBqZ3lNZEsyY0hhZUFPREZBTnc"    
    resp = requests.get(url)
    raw = resp.text
    better = raw[raw.index('(')+1:-2]
    return better

if __name__ == "__main__":
    app.run(debug=True)

