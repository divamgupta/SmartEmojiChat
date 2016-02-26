x = ["angel","colonthree","confused","cry","devil","frown","gasp","glasses","grin","grumpy","heart","kiki","kiss","pacman","smile","squint","sunglasses","tongue","unsure","upset","wink"]

from subprocess import Popen, PIPE
 
import base64

for p in x:
	process = Popen([  "wget"  , "http://demos.9lessons.info/emotions/emotions-fb/"+p+".gif"], stdout=PIPE)
	(output, err) = process.communicate()
	exit_code = process.wait()