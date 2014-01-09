from flask import Flask, render_template

app = Flask(__name__, static_url_path='/static')

@app.route("/")
def main():
    return render_template("index.html")

@app.route("/data")
def data(): # Just returns local data for now
    fname = "example.json"
    json = open(fname).read()
    return json

if __name__ == "__main__":
    app.run(debug=True)

