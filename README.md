# AggietimeD

AggietimeD is a simple daemon service written in 2.5 days to do some hacked CAS authentication
sit in the background, and listen to requests over a unix socket - making it easy to write 
scripts to get Aggie Time data wherever you need it!

## Installation

Something among the lines of:

```
git clone https://github.com/Simponic/aggietime-cli
cd aggietime-cli
npm i

sudo npm install -g .
cp .env.example .env
chmod 0700 .env
```

Then, set your A-Number and password in `.env`.

Finally (optional), change the values in `aggietimed.service` and install it in 
`~/.config/systemd/user`, and enable it with 
`systemctl --user daemon-reload && systemctl enable --now --user aggietimed`.

## Usage

Look at `aggietimed -h`.
