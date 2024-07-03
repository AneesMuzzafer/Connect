using Microsoft.AspNetCore.Identity;

namespace Connect.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string AccountName { get; set; } = String.Empty;
    }
}
