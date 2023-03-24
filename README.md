# AggietimeD

AggietimeD is a simple daemon service to open a SAML with selenium, steal a cookie,
then sit in the background listening to requests over a unix socket - making it 
"easy" to write scripts to get Aggie Time data, wherever you need it!

https://user-images.githubusercontent.com/25559600/219797856-76c82934-ceb2-4562-90bc-fff2250562a1.mp4

## Installation

Something among the lines of:

```
sudo pacman -S chromium pass

git clone https://github.com/Simponic/aggietimed
cd aggietimed
npm i

sudo npm install -g .

# Store password, a-number in gnu pass:
pass insert --multiline usu.edu
# <password>
# anumber: <anumber>
```

## Usage

Look at `aggietimed -h`. (hey, at least it's _something_)
