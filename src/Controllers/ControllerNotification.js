import express, { response } from 'express';
import ejs from 'ejs';
import ControllerTaccar from './ControllerTaccar.js';
import dotenv from "dotenv";
dotenv.config();


class ControllerNotification {

    EventType(type) {
        switch (type) {
            case 'ignitionOn':
                return '🔑  Ligou a ignição';
                break;

            case 'ignitionOff':
                return '🔑  Desligou a ignição';
                break;

            case 'deviceMoving':
                return '⚠️  Em Movimento';
                break;

            case 'deviceStopped':
                return '⚠️  Parou';
                break;

            case 'deviceOffline':
                return '⚠️  ficou offline';
                break;

            case 'deviceOnline':
                return '⚠️  ficou online';
                break;

            default:
                return '⚠️  Statos Desconecido';
                break;
        }
    }

    //
    async getEventoNotificantion(data) {
        const event = await fetch(`${process.env.HOST_TRACCAR}/api/events/${data.event}`, {
            headers: {
                "Cookie": await ControllerTaccar.token(),
                'Content-Type': 'application/json',
            },
        });

        const eventAtual = await event.json();
        const findDevice = await this.findDevice(eventAtual.deviceId);
        const findPosition = await this.findPosition(eventAtual.positionId);

        // return findPosition;

        const eventAnterior = async (eventAtual) => {
            let type;

            switch (eventAtual.type) {
                case 'ignitionOn':
                    type = '&type=ignitionOff';
                    break;

                case 'ignitionOff':
                    type = '&type=ignitionOn';
                    break;

                case 'deviceMoving':
                    type = '&type=deviceStopped';
                    break;

                case 'deviceStopped':
                    type = '&type=deviceMoving';
                    break;

                default:
                    type = '';
                    break;
            }

            // console.log(`${this.subtrair72HorasDaData(this.formatDateToISO(eventAtual.eventTime))} / ${this.formatDateToISO(eventAtual.eventTime)}`);

            const response = await fetch(`${process.env.HOST_TRACCAR}/api/reports/events?deviceId=${eventAtual.deviceId}${type}&from=${this.subtrair72HorasDaData(eventAtual.eventTime)}&to=${this.formatDateToISO(eventAtual.eventTime)}`, {
                headers: {
                    "Cookie": await ControllerTaccar.token(),
                    "Accept": "application/json"
                },
            });

            const events = await response.json();
            const Anterior = this.obterUltimoElemento(events);

            if (Anterior != null) {
                return `${this.EventType(Anterior.type)} a ${this.formatarDataHora(Anterior.eventTime)}`; //Anterior;
            }

            return null;
        }

        data.name = `🚘  Veiculo: ${findDevice.name}`;
        data.template = eventAtual.type;
        data.eventAnterior = await eventAnterior(eventAtual);
        data.eventAtual = `${this.EventType(eventAtual.type)} a ${this.formatarDataHora(eventAtual.eventTime)}`;
        data.locazacao = data.end; //null;//(findPosition && `🛰️ Localização (Google Maps): https://www.google.com/maps/search/${findPosition[0].latitude},${findPosition[0].longitude}` || null);

        return await this.sednotification(data);
    }

    //
    async findDevice(deviceId) {
        const response = await fetch(`${process.env.HOST_TRACCAR}/api/devices/${deviceId}`, {
            headers: {
                "Cookie": await ControllerTaccar.token(),
                'Content-Type': 'application/json',
            }
        });

        return await response.json();
    }

    //
    async findPosition(positionId) {
        const response = await fetch(`${process.env.HOST_TRACCAR}/api/positions?id=${positionId}`, {
            headers: {
                "Cookie": await ControllerTaccar.token(),
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            return await response.json();
        }

        return false;
    }

    //
    obterUltimoElemento(array) {
        if (Array.isArray(array) && array.length > 0) {
            return array[array.length - 1];
        } else {
            // Caso o array esteja vazio ou não seja um array
            return null; // Ou você pode escolher retornar undefined ou outra valor de sua escolha
        }
    }

    //
    formatarDataHora(dataString) {
        // Converta a string para um objeto Date
        const data = new Date(dataString);

        // Defina o fuso horário para o Brasil (Brasília)
        const fusoHorarioBrasil = 'America/Sao_Paulo';

        // Configure o fuso horário no objeto Date
        data.toLocaleString('en-US', { timeZone: fusoHorarioBrasil });

        // Obtenha as partes da data e hora
        const dia = data.getDate().toString().padStart(2, '0');
        const mes = (data.getMonth() + 1).toString().padStart(2, '0'); // Note que os meses são zero-indexed
        const ano = data.getFullYear();
        const horas = data.getHours().toString().padStart(2, '0');
        const minutos = data.getMinutes().toString().padStart(2, '0');

        // Retorne a data e hora formatadas com o fuso horário ajustado
        return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
    }

    //
    formatDateToISO(dataHoraString) {
        var data = new Date(dataHoraString);
        if (isNaN(data.getTime())) {
            throw new Error('Formato de data e hora inválido');
        }

        var ano = data.getUTCFullYear();
        var mes = (data.getUTCMonth() + 1).toString().padStart(2, '0');
        var dia = data.getUTCDate().toString().padStart(2, '0');
        var horas = data.getUTCHours().toString().padStart(2, '0');
        var minutos = data.getUTCMinutes().toString().padStart(2, '0');
        var segundos = data.getUTCSeconds().toString().padStart(2, '0');
        var milissegundos = data.getUTCMilliseconds().toString().padStart(3, '0');

        return `${ano}-${mes}-${dia}T${horas}:${minutos}:${segundos}.${milissegundos}Z`;
    }

    //
    subtrair72HorasDaData(dataString) {
        // Parse da string de data para um objeto Date
        const dataOriginal = new Date(dataString);

        // Subtrai 10 dias
        dataOriginal.setDate(dataOriginal.getDate() - 1);

        // Formata a data para o mesmo formato original (string ISO)
        const dataFormatada = dataOriginal.toISOString();

        return dataFormatada;
    }

    //
    calcularDiferencaTempo(dataInicialStr, dataFinalStr) {
        // Converta as strings para objetos Date
        const dataInicial = new Date(dataInicialStr);
        const dataFinal = new Date(dataFinalStr);

        // Calcule a diferença de tempo em milissegundos
        const diferencaTempoMs = dataFinal - dataInicial;

        // Converta a diferença de tempo para minutos
        const diferencaMinutos = Math.floor(diferencaTempoMs / (1000 * 60));

        // Calcule horas e minutos
        const horas = Math.floor(diferencaMinutos / 60);
        const minutos = diferencaMinutos % 60;

        // Formate a diferença de tempo como "HH:mm"
        const horasFormatadas = horas.toString().padStart(2, '0');
        const minutosFormatados = minutos.toString().padStart(2, '0');

        // Retorne a diferença de tempo formatada
        return `${horasFormatadas}:${minutosFormatados}`;
    }

    //
    async WhatsNotification(data) {
        const response = await fetch(`${process.env.HOST_WPPCONNECT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Accept': 'application/json',
                'Authorization': `Bearer ${process.env.TOKEN_WPPCONNECT}`
            },
            body: JSON.stringify({
                phone: `${data.phone}`,
                message: `${data.message}`
            })

        });

        return await response.json();
    }

    //
    async sednotification(temp) {
        let alert;

        ejs.renderFile(`./public/views/notification.ejs`, temp, (err, data) => {
            if (!err) {
                alert = data;
            } else {
                console.log(err);
            }
        });

        return alert; //await this.WhatsNotification(alert);
    }

    //
    async getNotication(req, res) {
        const temp = req.body;
        const evento = temp.message.split('||');

        if (evento[0] == 'ENVTO') {
            temp.message = {
                event:evento[1],
                end:evento[2]
            }

            temp.message = await this.getEventoNotificantion(temp.message);
        }

        console.log(temp);

        return await this.WhatsNotification(temp);
    }
}

export default new ControllerNotification();