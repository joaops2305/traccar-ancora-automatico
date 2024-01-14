import dotenv from "dotenv";
dotenv.config();

class traccar {
    async token() {
        const response = await fetch(`${process.env.HOST_TRACCAR}/api/session?token=${process.env.TOKEN_TRACCAR}`);
        return response.headers.get('set-cookie').split(';')[0];
    }

    async StartGrupos() {
        const response = await fetch(`${process.env.HOST_TRACCAR}/api/groups`, {
            headers: {
                "Cookie": await this.token(),
                'Content-Type': 'application/json',
            },
        });

        const listGroups = await response.json();

        for (let index = 0; index < listGroups.length; index++) {
            if (listGroups[index].attributes.Automaticancora) {
                await this.StartDevices(listGroups[index].id);
            }
        }
    }

    async StartDevices(groupId) {
        const response = await fetch(`${process.env.HOST_TRACCAR}/api/devices`, {
            headers: {
                "Cookie": await this.token(),
                'Content-Type': 'application/json',
            }
        });

        let cont = 0;

        const dispositivos = await response.json();

        for (let index = 0; index < dispositivos.length; index++) {
            if (dispositivos[index].groupId == groupId) {
                cont++;
                await this.geraAncora(dispositivos[index].positionId);
            }
        }

        console.log(cont);

        return cont;
    }

    async StopGrupos() {
        const response = await fetch(`${process.env.HOST_TRACCAR}/api/groups`, {
            headers: {
                "Cookie": await this.token(),
                'Content-Type': 'application/json',
            },
        });

        const listGroups = await response.json();

        for (let index = 0; index < listGroups.length; index++) {
            if (listGroups[index].attributes.Automaticancora) {
                await this.StopDevices(listGroups[index].id);
            }
        }
    }

    async StopDevices(groupId) {
        const response = await fetch(`${process.env.HOST_TRACCAR}/api/devices`, {
            headers: {
                "Cookie": await this.token(),
                'Content-Type': 'application/json',
            }
        });

        let cont = 0;

        const dispositivos = await response.json();

        for (let index = 0; index < dispositivos.length; index++) {
            if (dispositivos[index].groupId == groupId) {
                cont++;
                await this.deleAcora(dispositivos[index].id);
            }
        }

        console.log(cont);

        return cont;
    }


    async geraAncora(positionId) {
        const position = await fetch(`${process.env.HOST_TRACCAR}/api/positions?id=${positionId}`, {
            headers: {
                "Cookie": await this.token(),
                'Content-Type': 'application/json',
            }
        });

        const positionAtual = await position.json();

        let Acora = {
            name: 'Ancora-Automatica',
            area: `CIRCLE (${positionAtual[0].latitude} ${positionAtual[0].longitude}, 2)`,
        }

        const response = await fetch(`${process.env.HOST_TRACCAR}/api/geofences`, {
            method: 'POST',
            headers: {
                "Cookie": await this.token(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(Acora),
        });

        if (response.ok) {
            const item = await response.json();
            const permissionResponse = await fetch(`${process.env.HOST_TRACCAR}/api/permissions`, {
                method: 'POST',
                headers: {
                    "Cookie": await this.token(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ deviceId: positionAtual[0].deviceId, geofenceId: item.id }),
            });

            console.log(await permissionResponse.text());
        }

        return Acora;
    }

    async deleAcora(deviceId) {
        const geofences = await fetch(`${process.env.HOST_TRACCAR}/api/geofences`, {
            headers: {
                "Cookie": await this.token(),
                'Content-Type': 'application/json'
            },
        });

        const delGeofence = async (geofenceId) => {
            const response = await fetch(`${process.env.HOST_TRACCAR}/api/geofences/${geofenceId}`, {
                method: 'DELETE',
                headers: {
                    "Cookie": await this.token(),
                    'Content-Type': 'application/json'
                },
            });

            return await response.text();
        }

        const dispositivoGeofence = await geofences.json();

        for (let index = 0; index < dispositivoGeofence.length; index++) {
            if (dispositivoGeofence[index].name == "Ancora-Automatica") {
                await delGeofence(dispositivoGeofence[index].id);
            }
        }

        return dispositivoGeofence;
    }

}

export default new traccar();