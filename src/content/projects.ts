export interface Project {
  id: string
  title: string
  description: string
  tags: string[]
  url?: string
}

export const projects: Project[] = [
  {
    id: 'kompass',
    title: 'Kompass',
    description: 'Descripción próximamente.',
    tags: ['TypeScript', 'React', 'Node.js'],
  },
  {
    id: 'pausa',
    title: 'Pausa',
    description: 'Marca propia de velas artesanales. Aromas para la calma.',
    tags: ['Emprendimiento', 'Diseño', 'Producto'],
    url: 'https://pausa.com.ar',
  },
]
