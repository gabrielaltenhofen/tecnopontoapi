# Tecnoponto API

[![License](https://img.shields.io/github/license/gabrielaltenhofen/tecnopontoapi)](https://github.com/gabrielaltenhofen/tecnopontoapi/blob/master/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/gabrielaltenhofen/tecnopontoapi)](https://github.com/gabrielaltenhofen/tecnopontoapi/issues)
[![GitHub stars](https://img.shields.io/github/stars/gabrielaltenhofen/tecnopontoapi)](https://github.com/gabrielaltenhofen/tecnopontoapi/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/gabrielaltenhofen/tecnopontoapi)](https://github.com/gabrielaltenhofen/tecnopontoapi/network)

Este repositório contém a API para o sistema Tecnoponto, uma solução de controle de ponto para empresas.

## Descrição

A Tecnoponto API é uma parte fundamental do ecossistema Tecnoponto, que oferece uma plataforma abrangente para o gerenciamento eficiente de horários de trabalho dos funcionários. Esta API fornece os endpoints necessários para integração com outras ferramentas e serviços, permitindo automação e personalização de processos de registro de ponto.

## Recursos Principais

- **Registro de Ponto**: Permitindo que os funcionários registrem entrada e saída de forma eficiente.
- **Administração de Usuários**: Gerenciamento completo de usuários, incluindo adição, remoção e atualização.
- **Relatórios Personalizados**: Geração de relatórios personalizados com base em dados de registro de ponto.
- **Integração com Sistemas Externos**: Facilitando a integração com sistemas de RH, folha de pagamento e outros.

## Instalação

1. Clone este repositório: `git clone https://github.com/gabrielaltenhofen/tecnopontoapi.git`
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente conforme necessário.
4. Inicie o servidor: `npm start`

## Endpoints

### Recuperar Batidas de Ponto
- Parâmetros:

  - **usuario:** ID do usuário
  - **ano:** Ano das batidas
  - **mes:** Mês das batidas
    
- Exemplo de uso:
    ```http
    GET /batidas_de_ponto/:usuario/:ano/:mes
    ```
    **Descrição:** Retorna uma lista de todos os usuários com suas tags e nomes.

    **Exemplo de Retorno:**
    ```json
     {
        "batida1": {
          "data_hora": "08:00"
        },
        "batida2": {
          "data_hora": "12:00"
        }
    }
    ```
### Registro Ponto

- Parâmetros:

  - **usuario:** Tag do usuário
    
- Exemplo de uso:
    ```http
    GET /registrar_ponto?usuario=tagUsuario
    ```
    **Descrição:** Retorna uma lista de todos os usuários com suas tags e nomes.

    **Exemplo de Retorno:**
    ```json
     {
        "message": "Batida de ponto registrada com sucesso!"
     }
    ```

### Listar Funcionários

- Exemplo de uso:
    
    ```http
    GET /funcionario
    ```
    **Descrição:** Retorna uma lista de todos os usuários com suas tags e nomes.

    **Exemplo de Retorno:**
    ```json
    {
      "tag": "tag123",
      "name": "João"
    },
    {
      "tag": "tag124",
      "name": "Maria"
    }
    ```
### Buscar Funcionário pela Tag
- Parâmetros:
  
  - **tag:** Tag do usuário
- Exemplo de uso:
    
    ```http
    GET /funcionario/tag/:tag
    ```
    **Descrição:** Retorna uma lista de todos os usuários com suas tags e nomes.

    **Exemplo de Retorno:**
    ```json
    {
      "tag": "tag123",
      "name": "João",
      "status": "Ativo"
    }
    ```

### Gravar Leitura Biométrica
- Parâmetros:
  
  - **leitura:** Dados da leitura biométrica
- Exemplo de uso:
    
    ```http
    GET /gravar-leitura-biometrica?leitura=leituraBiometrica
    ```
    **Descrição:** Retorna uma lista de todos os usuários com suas tags e nomes.

    **Exemplo de Retorno:**
    ```json
      {
        "message": "Leitura gravada com sucesso"
      }
    ```
### Retornar Dados de Biometria

- Exemplo de uso:
    
    ```http
    GET  /dados_biometria
    ```
    **Descrição:** Retorna uma lista de todos os usuários com suas tags e nomes.

    **Exemplo de Retorno:**
    ```json
    {
      "1": "tag123",
      "2": "tag124"
    }
    ```
    
## Licença

Este projeto é licenciado sob a [Licença MIT](https://github.com/gabrielaltenhofen/tecnopontoapi/blob/master/LICENSE).

## Contato

Para perguntas, sugestões ou problemas relacionados a este projeto, sinta-se à vontade para entrar em contato com o mantenedor:

Gabriel Altenhofen - gabrielgirardih@gmail.com
