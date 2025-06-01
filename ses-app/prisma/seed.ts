import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Skill
  await prisma.skill.createMany({
    data: [
      { name: 'TypeScript' },
      { name: 'React' },
      { name: 'Python' },
      { name: 'AWS' },
      { name: 'SQL' }
    ]
  });
  const skillRecords = await prisma.skill.findMany();

  // User
  const user1 = await prisma.user.create({
    data: {
      name: '山田 太郎',
      email: 'taro@example.com',
      desiredPrice: 600000,
      availableFrom: new Date(),
      description: 'フロントエンドエンジニア',
      status: 'active',
      role: 'engineer',
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      skills: {
        create: [
          { skill: { connect: { name: 'TypeScript' } } },
          { skill: { connect: { name: 'React' } } }
        ]
      }
    }
  });
  const user2 = await prisma.user.create({
    data: {
      name: '佐藤 花子',
      email: 'hanako@example.com',
      desiredPrice: 800000,
      availableFrom: new Date(),
      description: 'バックエンド・Python/AWSエンジニア',
      status: 'active',
      role: 'engineer',
      isAvailable: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      skills: {
        create: [
          { skill: { connect: { name: 'Python' } } },
          { skill: { connect: { name: 'AWS' } } }
        ]
      }
    }
  });
  const user3 = await prisma.user.create({
    data: {
      name: '管理 太郎',
      email: 'admin@example.com',
      desiredPrice: 0,
      availableFrom: new Date(),
      description: '管理者・営業',
      status: 'active',
      role: 'admin',
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      skills: {
        create: [
          { skill: { connect: { name: 'SQL' } } },
          { skill: { connect: { name: 'AWS' } } }
        ]
      }
    }
  });

  // Project
  const project1 = await prisma.project.create({
    data: {
      title: 'SES案件A',
      price: 700000,
      periodStart: new Date(),
      periodEnd: new Date(new Date().setMonth(new Date().getMonth() + 6)),
      description: 'TypeScript/React案件',
      status: 'open',
      published: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    }
  });
  const project2 = await prisma.project.create({
    data: {
      title: 'Python/AWS案件',
      price: 900000,
      periodStart: new Date(),
      periodEnd: new Date(new Date().setMonth(new Date().getMonth() + 3)),
      description: 'PythonとAWSを活用したデータ分析案件',
      status: 'closed',
      published: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    }
  });

  // Interaction
  await prisma.interaction.createMany({
    data: [
      {
        projectId: project1.id,
        engineerId: user1.id,
        message: 'ご提案ありがとうございます',
        progress: '面談調整中',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        projectId: project1.id,
        engineerId: user2.id,
        message: '案件に興味があります',
        progress: '書類選考中',
        isRead: true,
        readAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        projectId: project2.id,
        engineerId: user2.id,
        message: 'Python案件のご相談',
        progress: 'アサイン済み',
        isRead: true,
        readAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      },
      {
        projectId: project2.id,
        engineerId: user3.id,
        message: '管理者からの連絡',
        progress: '管理対応',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      }
    ]
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 