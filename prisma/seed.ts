import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('admin123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@revistalaboratorio.com.ar' },
    update: {},
    create: {
      email: 'admin@revistalaboratorio.com.ar',
      username: 'admin',
      name: 'Administrador',
      password,
      role: 'ADMIN',
      bio: 'Administrador de Revista Laboratorio',
    },
  })

  console.log('Admin creado:', admin.email)

  const categories = [
    { name: 'Ciencia', slug: 'ciencia', children: ['Física', 'Química', 'Biología'] },
    { name: 'Tecnología', slug: 'tecnologia', children: ['Software', 'Hardware', 'IA'] },
    { name: 'Cultura', slug: 'cultura', children: ['Arte', 'Literatura', 'Música'] },
    { name: 'Ensayo', slug: 'ensayo', children: [] },
    { name: 'Opinión', slug: 'opinion', children: [] },
  ]

  for (const cat of categories) {
    const parent = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: { name: cat.name, slug: cat.slug },
    })

    for (const childName of cat.children) {
      const childSlug = `${cat.slug}-${childName.toLowerCase().replace(/ /g, '-')}`
      await prisma.category.upsert({
        where: { slug: childSlug },
        update: {},
        create: { name: childName, slug: childSlug, parentId: parent.id },
      })
    }
  }

  console.log('Categorías creadas.')

  const samplePosts = [
    {
      title: 'Bienvenidos a Revista Laboratorio',
      slug: 'bienvenidos-a-revista-laboratorio',
      excerpt: 'Un espacio para el pensamiento, la ciencia y la cultura.',
      content: `# Bienvenidos a Revista Laboratorio

Revista Laboratorio es un espacio de pensamiento, ciencia y cultura donde escritores, investigadores y curiosos comparten sus ideas.

## Nuestra misión

Creemos que el conocimiento debe circular libremente. Este es un espacio para:

- **Ensayos** sobre ciencia y tecnología
- **Reflexiones** sobre cultura y arte
- **Investigaciones** originales
- **Opiniones** fundamentadas

## ¿Cómo funciona?

Esta revista funciona por invitación. Si querés publicar tu trabajo, contactate con nosotros para recibir una invitación.

> "El laboratorio es el lugar donde las ideas se ponen a prueba."

Esperamos que este espacio sea fructífero para todos.`,
      published: true,
      views: 150,
    },
    {
      title: 'El método científico en la era digital',
      slug: 'metodo-cientifico-era-digital',
      excerpt: 'Cómo las herramientas digitales están transformando la investigación científica.',
      content: `# El método científico en la era digital

La revolución digital ha transformado todos los aspectos de nuestra vida, y la investigación científica no es la excepción.

## Datos masivos y reproducibilidad

El acceso a grandes volúmenes de datos permite realizar estudios a escala nunca antes imaginada. Sin embargo, esto también trae nuevos desafíos en términos de reproducibilidad y transparencia.

## Inteligencia artificial como herramienta

Los algoritmos de machine learning están acelerando el descubrimiento científico en áreas como:

- Descubrimiento de nuevos medicamentos
- Análisis de imágenes médicas
- Modelado climático

## Conclusiones

La ciencia del siglo XXI requiere nuevas competencias y nuevas formas de colaboración.`,
      published: true,
      views: 89,
    },
    {
      title: 'Ensayo sobre el tiempo libre',
      slug: 'ensayo-sobre-el-tiempo-libre',
      excerpt: 'Una reflexión sobre el valor del ocio en la sociedad contemporánea.',
      content: `# Ensayo sobre el tiempo libre

En una sociedad obsesionada con la productividad, el tiempo libre se ha convertido en un bien escaso y mal comprendido.

## El paradoja del ocio moderno

Paradójicamente, mientras tenemos más herramientas para "ahorrar tiempo", sentimos que tenemos menos tiempo libre que nunca. Las notificaciones, el trabajo remoto y la hiperconectividad han borrado los límites entre el tiempo productivo y el tiempo propio.

## Una defensa del aburrimiento

El aburrimiento, lejos de ser un defecto, es la condición necesaria para la creatividad. Los estudios neurocientíficos muestran que la mente en reposo es cuando se producen las conexiones más interesantes.

## Hacia una nueva ética del descanso

Necesitamos recuperar el derecho al descanso, no como recompensa por el trabajo, sino como condición fundamental de una vida plena.`,
      published: true,
      views: 234,
    },
  ]

  for (const post of samplePosts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: { ...post, authorId: admin.id },
    })
  }

  console.log('Posts de ejemplo creados.')
  console.log('\n✅ Base de datos inicializada correctamente.')
  console.log('   Admin: admin@revistalaboratorio.com.ar')
  console.log('   Contraseña: admin123')
  console.log('   ⚠️  Cambiá la contraseña en producción.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
