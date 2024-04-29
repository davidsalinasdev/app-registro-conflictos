export class Usuario {
    constructor(
        public id: number,
        public email: string,
        public nombres?: string,
        public apellidos?: string,
        public pasword?: string,
        public estado?: string,
        public descripcion?: string,
        public created_at?: string,
        public updated_at?: string
    ) { }
}