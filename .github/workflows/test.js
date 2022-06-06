const issueLabels = [{"id":4046962594,"node_id":"LA_kwDOF_Oe2s7xN7-i","url":"https://api.github.com/repos/benelan/test/labels/figma","name":"figma","color":"07D791","default":false,"description":""},{"id":4206213801,"node_id":"LA_kwDOF_Oe2s76tbqp","url":"https://api.github.com/repos/benelan/test/labels/0%20-%20new","name":"0 - new","color":"d4c5f9","default":false,"description":""},{"id":4206525500,"node_id":"LA_kwDOF_Oe2s76unw8","url":"https://api.github.com/repos/benelan/test/labels/milestone%20adjusted","name":"milestone adjusted","color":"e99695","default":false,"description":""}]

const labels =  [...issueLabels
.map((label) => label.name).filter(name => name !== "milestone adjusted"), "milestone adjusted"]

console.log(labels)