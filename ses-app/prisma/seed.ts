import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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

  // パスワードのハッシュ化
  const defaultPassword = await bcrypt.hash('password123', 12);
  const adminPassword = await bcrypt.hash('admin123', 12);

  // User（認証用管理者ユーザー）
  const adminUser = await prisma.user.create({
    data: {
      name: '管理 太郎',
      email: 'admin@example.com',
      password: adminPassword,
      desiredPrice: 0,
      availableFrom: new Date(),
      description: 'システム管理者',
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

  // User（営業ユーザー）
  const salesUser = await prisma.user.create({
    data: {
      name: '営業 花子',
      email: 'sales@example.com',
      password: defaultPassword,
      desiredPrice: 0,
      availableFrom: new Date(),
      description: '営業担当者',
      status: 'active',
      role: 'sales',
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      skills: {
        create: []
      }
    }
  });

  // User（技術者ユーザー）
  const user1 = await prisma.user.create({
    data: {
      name: '山田 太郎',
      email: 'taro@example.com',
      password: defaultPassword,
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
      password: defaultPassword,
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
        engineerId: salesUser.id,
        message: '営業からの連絡',
        progress: '営業対応',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      }
    ]
  });

  console.log('🌱 Seed data created successfully!');
  console.log('👤 Admin user: admin@example.com / admin123');
  console.log('👤 Sales user: sales@example.com / password123');
  console.log('👤 Engineer users: taro@example.com, hanako@example.com / password123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 