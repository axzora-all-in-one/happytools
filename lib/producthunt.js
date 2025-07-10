import { gql } from '@apollo/client';

export const GET_AI_TOOLS = gql`
  query GetAITools($after: String, $first: Int) {
    posts(
      first: $first, 
      after: $after,
      order: NEWEST
    ) {
      edges {
        node {
          id
          name
          tagline
          description
          votesCount
          createdAt
          url
          website
        }
      }
    }
  }
`;

export const SEARCH_AI_TOOLS = gql`
  query SearchAITools($after: String, $first: Int, $query: String!) {
    search(
      first: $first,
      after: $after,
      query: $query,
      types: [POST]
    ) {
      edges {
        node {
          ... on Post {
            id
            name
            tagline
            description
            votesCount
            createdAt
            url
            website
            makers {
              id
              name
              username
              profileImage
            }
            topics {
              edges {
                node {
                  id
                  name
                }
              }
            }
          }
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

// Helper function to check if a tool is AI-related
export const isAITool = (tool) => {
  if (!tool) return false;
  
  const aiKeywords = [
    'ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning',
    'neural network', 'chatbot', 'gpt', 'llm', 'large language model',
    'computer vision', 'nlp', 'natural language processing', 'automation',
    'intelligent', 'smart', 'assistant', 'generative', 'predictive'
  ];
  
  const textToCheck = `${tool.name} ${tool.tagline} ${tool.description}`.toLowerCase();
  
  // Check topics
  const topics = tool.topics?.edges?.map(edge => edge.node.name.toLowerCase()) || [];
  const hasAITopic = topics.some(topic => aiKeywords.some(keyword => topic.includes(keyword)));
  
  // Check text content
  const hasAIContent = aiKeywords.some(keyword => textToCheck.includes(keyword));
  
  return hasAITopic || hasAIContent;
};