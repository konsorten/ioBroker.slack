![Logo](admin/slack.png)
# ioBroker.slack
=================

Adapter that connects ioBroker as a bot to Slack.

EARLY DEVELOPMENT VERSION!

Currently, this adapter can only send unformatted messages to a certain channel. 
However, the adapter is in constant development. In later versions, it will 
also be able to process incoming messages.

## Getting Started

### Send a Message to the Default Channel

`sendTo("slack", "your message");`

### Send a Message to a Custom Channel

`sendTo("slack", { text: "your message", channel: "#channelname });`

## Changelog
### 0.2.0 (2018-02-24)
* Now using slack client library from Slack


### 0.1.0 (2018-02-18)
* Initial development release



## License
The MIT License (MIT)

Copyright (c) 2018 marvin + konsorten GmbH <dev@konsorten.de>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
