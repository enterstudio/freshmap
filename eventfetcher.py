#!/usr/bin/env python

import time
import urllib

events_url = 'http://www.freshbooks.com/recent-events'

def fetch_events():
    h = urllib.urlopen(events_url)
    content = h.read()
    print content
    
def fetch_events_loop():
    try:
        while 1:
            fetch_events()
            time.sleep(5)
    except KeyboardInterrupt:
        print "Got a Ctrl+C. Exiting!"
        
if __name__ == '__main__':
    fetch_events_loop()