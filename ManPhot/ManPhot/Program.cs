using System;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace ManPhot
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseWebRoot(GetWebRootPath());
                    webBuilder.UseStartup<Startup>();
                });

        private static string GetWebRootPath()
        {
            System.Diagnostics.Debugger.Launch();
            const string BinFolderName = "bin";
            const string WwwRootFolderName = "wwwroot";
            const string ManPhotFolderName = "ManPhot";

            var currentDirectoryArray = Directory.GetCurrentDirectory().Split('\\');

            var length = Array.FindLastIndex(currentDirectoryArray, dir => dir == ManPhotFolderName) + 2;

            var webRootPathArray = new string[length];

            Array.Copy(currentDirectoryArray, webRootPathArray, length);

            webRootPathArray[length - 1] = WwwRootFolderName;

            var webRoot = Path.Combine(string.Join('\\', webRootPathArray));
            return webRoot;
        }
    }
}