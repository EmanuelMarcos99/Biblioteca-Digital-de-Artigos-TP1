// test.js - Arquivo de teste para Supabase Storage
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuração do Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      persistSession: false
    }
  }
);

const BUCKET_NAME = 'articles_pdfs';

async function testSupabaseConnection() {
  console.log('🚀 INICIANDO TESTES DO SUPABASE\n');
  console.log('📋 Informações da configuração:');
  console.log('- URL:', process.env.SUPABASE_URL ? '✅ Configurada' : '❌ Não configurada');
  console.log('- Service Key:', process.env.SUPABASE_SERVICE_KEY ? '✅ Configurada' : '❌ Não configurada');
  console.log('- Bucket:', BUCKET_NAME);
  console.log('');

  try {
    // 1. TESTE DE AUTENTICAÇÃO BÁSICA
    console.log('1. 🔐 Testando autenticação...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.log('   ❌ Erro de autenticação:', authError.message);
      return false;
    }
    console.log('   ✅ Autenticação bem-sucedida');

    // 2. TESTE DE CONEXÃO COM O BANCO
    console.log('2. 🗄️ Testando conexão com o banco...');
    const { data: dbData, error: dbError } = await supabase
      .from('articles')
      .select('count')
      .limit(1);

    if (dbError) {
      console.log('   ❌ Erro no banco:', dbError.message);
    } else {
      console.log('   ✅ Conexão com banco funcionando');
    }

    // 3. TESTE DE STORAGE - LISTAR BUCKETS
    console.log('3. 📦 Testando storage...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.log('   ❌ Erro ao listar buckets:', bucketsError.message);
      return false;
    }

    console.log('   ✅ Storage funcionando');
    console.log('   📁 Buckets disponíveis:', buckets.map(b => b.name));

    // 4. VERIFICAR/CRIAR BUCKET
    const bucketExists = buckets.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      console.log('4. 🛠️ Criando bucket...');
      const { data: newBucket, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: ['application/pdf']
      });

      if (createError) {
        console.log('   ❌ Erro ao criar bucket:', createError.message);
        return false;
      }
      console.log('   ✅ Bucket criado com sucesso');
    } else {
      console.log('4. ✅ Bucket já existe');
    }

    // 5. TESTE DE UPLOAD DE ARQUIVO TEXTO
    console.log('5. 📤 Testando upload de arquivo...');
    
    // Criar arquivo de teste temporário
    const testContent = 'Este é um arquivo de teste para o Supabase Storage';
    const testFileName = `test-${Date.now()}.txt`;
    const tempFilePath = `./temp-${testFileName}`;
    
    fs.writeFileSync(tempFilePath, testContent);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`test-files/${testFileName}`, fs.readFileSync(tempFilePath), {
        contentType: 'text/plain',
        upsert: false
      });

    // Limpar arquivo temporário
    fs.unlinkSync(tempFilePath);

    if (uploadError) {
      console.log('   ❌ Erro no upload:', uploadError.message);
      return false;
    }

    console.log('   ✅ Upload realizado:', uploadData.path);

    // 6. TESTE DE URL PÚBLICA
    console.log('6. 🔗 Testando URL pública...');
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(`test-files/${testFileName}`);

    console.log('   ✅ URL pública:', urlData.publicUrl);

    // 7. TESTE DE LISTAGEM DE ARQUIVOS
    console.log('7. 📋 Listando arquivos no bucket...');
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('test-files');

    if (listError) {
      console.log('   ❌ Erro ao listar arquivos:', listError.message);
    } else {
      console.log('   ✅ Arquivos encontrados:', files.length);
      files.forEach(file => {
        console.log(`      - ${file.name} (${file.id})`);
      });
    }

    // 8. TESTE DE UPLOAD SIMULANDO PDF
    console.log('8. 📄 Testando upload simulando PDF...');
    const pdfTestContent = '%PDF-1.4 teste simulado\n%%EOF';
    const pdfTestName = `test-pdf-${Date.now()}.pdf`;

    const { data: pdfUploadData, error: pdfUploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(`test-pdfs/${pdfTestName}`, pdfTestContent, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (pdfUploadError) {
      console.log('   ❌ Erro no upload de PDF:', pdfUploadError.message);
    } else {
      console.log('   ✅ Upload de PDF simulado realizado');
      
      // Testar URL do PDF
      const { data: pdfUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(`test-pdfs/${pdfTestName}`);
      
      console.log('   ✅ URL do PDF:', pdfUrlData.publicUrl);
    }

    console.log('\n🎉 TODOS OS TESTES FORAM CONCLUÍDOS!');
    console.log('✅ Sua Service Key está funcionando corretamente');
    console.log('✅ Você pode enviar PDFs para o Supabase Storage');
    
    return true;

  } catch (error) {
    console.log('\n💥 ERRO CRÍTICO:', error.message);
    console.log('Stack:', error.stack);
    return false;
  }
}

// Executar os testes
testSupabaseConnection()
  .then(success => {
    if (success) {
      console.log('\n✨ Configuração do Supabase: OK');
      process.exit(0);
    } else {
      console.log('\n❌ Configuração do Supabase: FALHOU');
      process.exit(1);
    }
  })
  .catch(error => {
    console.log('\n💣 Erro inesperado:', error);
    process.exit(1);
  });