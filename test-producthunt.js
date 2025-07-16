const fetch = require('node-fetch')

async function testProductHuntAPI() {
  try {
    console.log('Testing Product Hunt API...')
    
    const response = await fetch('https://api.producthunt.com/v2/api/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer 4KokghZ1bRH-BaL52k8Zf1BUjauROj5DrNpBBLjwVj8`,
        'Content-Type': 'application/json',
        'User-Agent': 'HappyTools/1.0'
      },
      body: JSON.stringify({
        query: `
          query GetPosts($first: Int) {
            posts(first: $first, order: RANKING) {
              edges {
                node {
                  id
                  name
                  tagline
                  description
                  url
                  votesCount
                  featuredAt
                  createdAt
                  website
                  thumbnail {
                    url
                  }
                  maker {
                    name
                  }
                  topics {
                    edges {
                      node {
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          first: 10
        }
      })
    })
    
    const data = await response.json()
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors)
      return
    }
    
    console.log('✅ Product Hunt API Response:')
    console.log(`Found ${data.data?.posts?.edges?.length} posts`)
    
    data.data?.posts?.edges?.slice(0, 3).forEach((edge, index) => {
      const post = edge.node
      console.log(`${index + 1}. ${post.name} - ${post.tagline} (${post.votesCount} votes)`)
    })
    
  } catch (error) {
    console.error('Error testing Product Hunt API:', error)
  }
}

testProductHuntAPI()