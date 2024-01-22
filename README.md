# traccar-ancora-automatico
Script Traccar Ancora Automatica

Configurção traccar

<entry key='notificator.sms.manager.class'>org.traccar.sms.HttpSmsClient</entry>
<entry key='sms.http.url'>http://localhost:8085/notification</entry>
<entry key='sms.http.template'>{"numero": "{phone}","mensagem":"{message}"}</entry>

Edita os Temples de Notificação

1 - ignitionOn
2 - ignitionOff
3 - deviceMoving
4 - deviceStopped

com este script

ENVTO||$event.id||🛣️  #{if}($position.address)Endereço: $position.address#{end}