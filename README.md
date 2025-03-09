# Quick Start

There are a couple of files you need to create so that things can connect properly.

## db.ini
You need a db.ini file containing your mongodb instance connect string(based on the example):

`mongodb://localhost:27017`

## .env file
There is a secret key that will be the basis for session tokens.  Here's an easy way to generate one:
`openssl rand -base64 32`

You need to put this into a .env file containing your own SECRET_KEY (based on example).  

```
SECRET_KEY=gu0WXtyQHnR3R+5bnIoVJGdC2EWojkDlr312Mw2gOr4=

```
