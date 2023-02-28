# AggietimeD

AggietimeD is a simple daemon service to open a SAML with selenium, steal a cookie,
then sit in the background listening to requests over a unix socket - making it 
"easy" to write scripts to get Aggie Time data, wherever you need it!


https://user-images.githubusercontent.com/25559600/219797856-76c82934-ceb2-4562-90bc-fff2250562a1.mp4


## Installation

Something among the lines of:

```
sudo pacman -S chromium

git clone https://github.com/Simponic/aggietime-cli
cd aggietime-cli
npm i

sudo npm install -g .

cp .env.example .env
chmod 0700 .env
```

Then, set your A-Number and password in `.env`.

### SystemD Service

UPDATE: (no) Thanks to the SAML update to AggieTime, we require selenium for auth.
The SystemD service will not work. Instead, I suggest starting a script to watch
`aggietimed` with your window manager / desktop environment, restarting if it fails, 
as in `watch_aggietimed.sh`.

If at some point CAS does come back, checkout the `cas-auth` branch.

## Usage

Look at `aggietimed -h`.
