export class Reunion {
    constructor(
        public id: number,
        public fecha_inicio: string,
        public hora_inicio: string,
        public lugar_reunion: string,
        public medida: string,
        public actor_demandante: string,
        public demanda: string,
        public actor_demandado: string,
        public situacion_actual: string,
        public nivel_tendencia: string,
        public fuente: string,
        public estado?: number,
        public usuarios_id?: number,
        public created_at?: string,
        public updated_at?: string
    ) { }
}